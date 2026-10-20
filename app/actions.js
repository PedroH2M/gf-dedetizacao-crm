"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { one } from "@/lib/db";
import { DUMMY_HASH, verifyPassword } from "@/lib/password";
import { COOKIE_NAME, SESSION_MAX_AGE, createToken } from "@/lib/session";
import { requireSession } from "@/lib/dal";
import { DOCS } from "@/lib/constants";
import { digits, hojeISO, isISODate, parseValor } from "@/lib/format";
import {
  countVinculos,
  deleteClienteDb,
  deleteDocDb,
  getCliente,
  getConfig,
  getDoc,
  removerAssinaturaDocDb,
  removerAssinaturaGFDocDb,
  removerAssinaturaOSDb,
  saveAssinaturaDocDb,
  saveAssinaturaGFDocDb,
  saveAssinaturaOSDb,
  saveClienteDb,
  saveDocDb,
  setConfig,
  setStatusDb,
} from "@/lib/queries";
import { dispatchWhatsApp } from "@/lib/whatsapp-api";
import { dispatchEmail } from "@/lib/email-api";
import { resumoTexto } from "@/lib/share";

// ---------------------------------------------------------------- Autenticação

const MAX_TENTATIVAS = 5;
const JANELA_MS = 15 * 60 * 1000;
const tentativas = (globalThis.__gfTentativas ??= new Map());

async function chaveTentativa(email) {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") || "local").split(",")[0].trim();
  return `${ip}|${email}`;
}

export async function login(_prev, formData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const senha = String(formData.get("senha") || "").trim();
  const values = { email };

  const chave = await chaveTentativa(email);
  const reg = tentativas.get(chave);
  if (reg && reg.ate > Date.now() && reg.n >= MAX_TENTATIVAS) {
    const min = Math.ceil((reg.ate - Date.now()) / 60000);
    return { error: `Muitas tentativas. Tente novamente em ${min} min.`, values };
  }

  const user = email ? await one("SELECT id, senha_hash FROM usuarios WHERE email = ?", email) : null;
  // Sempre executa o scrypt (mesmo sem usuário) para igualar o tempo de resposta.
  const ok = verifyPassword(senha, user?.senha_hash ?? DUMMY_HASH) && !!user;

  if (!ok) {
    const atual = reg && reg.ate > Date.now() ? reg : { n: 0, ate: Date.now() + JANELA_MS };
    atual.n += 1;
    tentativas.set(chave, atual);
    return { error: "E-mail ou senha incorretos.", values };
  }

  tentativas.delete(chave);
  const h = await headers();
  const isHttps = h.get("x-forwarded-proto") === "https" || process.env.COOKIE_SECURE === "true";

  (await cookies()).set(COOKIE_NAME, createToken(user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  redirect("/");
}

export async function logout() {
  (await cookies()).delete(COOKIE_NAME);
  redirect("/login");
}

// -------------------------------------------------------------------- Clientes

const campo = (fd, k, max) => String(fd.get(k) ?? "").trim().slice(0, max);
const pick = (fd, keys) => Object.fromEntries(keys.map((k) => [k, String(fd.get(k) ?? "")]));
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function saveCliente(_prev, fd) {
  await requireSession();
  const values = pick(fd, ["id", "nome", "telefone", "email", "endereco", "anotacoes"]);

  const id = Number(fd.get("id")) || 0;
  const nome = campo(fd, "nome", 120);
  const telefone = campo(fd, "telefone", 30);
  const email = campo(fd, "email", 120);
  const endereco = campo(fd, "endereco", 300);
  const anotacoes = campo(fd, "anotacoes", 2000);

  if (nome.length < 2) return { error: "Informe o nome do cliente.", values };
  if (digits(telefone).length < 10 || digits(telefone).length > 13)
    return { error: "Telefone inválido. Use DDD + número (ex.: 11 91234-5678).", values };
  if (email && !EMAIL_RE.test(email)) return { error: "E-mail inválido.", values };
  if (id && !(await getCliente(id))) return { error: "Cliente não encontrado.", values };

  const novoId = await saveClienteDb({ id, nome, telefone, email, endereco, anotacoes });
  revalidatePath("/", "layout");
  redirect(`/clientes/${novoId}`);
}

export async function deleteCliente(id) {
  await requireSession();
  id = Number(id);
  if ((await countVinculos(id)) > 0) redirect(`/clientes/${id}?erro=vinculos`);
  await deleteClienteDb(id);
  revalidatePath("/", "layout");
  redirect("/clientes");
}

// ---------------------------------------------------- Ordens de Serviço / Propostas

const CAMPOS_DOC = [
  "id", "cliente_id", "data", "servico", "produtos", "valor", "status",
  "observacoes", "metodologia", "validade",
];

async function salvarDoc(tipo, fd) {
  await requireSession();
  const cfg = DOCS[tipo];
  const values = pick(fd, CAMPOS_DOC);

  const id = Number(fd.get("id")) || 0;
  const cliente_id = Number(fd.get("cliente_id")) || 0;
  const data = campo(fd, "data", 10);
  const servico = campo(fd, "servico", 200);
  const produtos = campo(fd, "produtos", 1000);
  const valor = parseValor(fd.get("valor"));
  const status = campo(fd, "status", 30);
  const observacoes = campo(fd, "observacoes", 2000);
  const metodologia = campo(fd, "metodologia", 2000);
  const validade = campo(fd, "validade", 10);

  const erro = (error) => ({ error, values });
  if (!cliente_id || !(await getCliente(cliente_id))) return erro("Selecione o cliente.");
  if (!isISODate(data)) return erro("Informe uma data válida.");
  if (servico.length < 2) return erro("Informe o serviço.");
  if (valor === null || valor < 0 || valor > 10_000_000) return erro("Valor inválido.");
  if (!cfg.status.includes(status)) return erro("Status inválido.");
  if (tipo === "orcamento" && !isISODate(validade)) return erro("Informe a validade da proposta.");
  if (id && !(await getDoc(cfg.table, id))) return erro("Registro não encontrado.");

  const novoId = await saveDocDb(cfg.table, {
    id, cliente_id, data, servico, produtos, valor, status, observacoes,
    metodologia: tipo === "orcamento" ? metodologia : null,
    validade: tipo === "orcamento" ? validade : null,
  });
  revalidatePath("/", "layout");
  redirect(`/${cfg.rota}/${novoId}`);
}

export const saveOS = async (_prev, fd) => salvarDoc("os", fd);
export const saveOrcamento = async (_prev, fd) => salvarDoc("orcamento", fd);

export async function setStatus(tipo, id, status) {
  await requireSession();
  const cfg = DOCS[tipo];
  if (!cfg || !cfg.status.includes(status)) return;
  await setStatusDb(cfg.table, Number(id), status);
  revalidatePath("/", "layout");
}

export async function deleteDoc(tipo, id) {
  await requireSession();
  const cfg = DOCS[tipo];
  if (!cfg) return;
  await deleteDocDb(cfg.table, Number(id));
  revalidatePath("/", "layout");
  redirect(`/${cfg.rota}`);
}

/** Cria uma OS a partir de uma proposta e marca a proposta como Aprovada. */
export async function converterOrcamento(id) {
  await requireSession();
  const o = await getDoc(DOCS.orcamento.table, Number(id));
  if (!o) redirect("/orcamentos");
  const osId = await saveDocDb(DOCS.os.table, {
    id: 0,
    cliente_id: o.cliente_id,
    data: hojeISO(),
    servico: o.servico,
    produtos: o.produtos,
    valor: o.valor,
    status: "Agendada",
    observacoes: `Gerada a partir da Proposta nº ${String(o.id).padStart(4, "0")}.`,
  });
  await setStatusDb(DOCS.orcamento.table, o.id, "Aprovado");
  revalidatePath("/", "layout");
  redirect(`/os/${osId}/editar`);
}

// ---------------------------------------------------------------- Assinaturas Digitais (Cliente e GF)

function formatarTimestampAssinatura() {
  return new Date().toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Salva a assinatura digital do cliente (em OS ou Orçamento) pelo CRM */
export async function salvarAssinaturaDoc(tipo, docId, formData) {
  await requireSession();
  const cfg = DOCS[tipo];
  if (!cfg) return { error: "Tipo de documento inválido." };
  const id = Number(docId);
  if (!id) return { error: "ID inválido." };

  const imagem = String(formData.get("imagem") || "");
  const nome = String(formData.get("nome") || "").trim().slice(0, 120);
  const documento = String(formData.get("documento") || "").trim().slice(0, 40);

  if (!imagem || !imagem.startsWith("data:image/png;base64,")) {
    return { error: "Por favor, faça a assinatura no quadro antes de salvar." };
  }
  if (!nome || nome.length < 2) {
    return { error: "Informe o nome legível de quem assinou." };
  }

  const em = formatarTimestampAssinatura();
  await saveAssinaturaDocDb(cfg.table, id, { imagem, nome, documento, em });

  // Se for proposta comercial pendente/enviada, atualiza automaticamente para Aprovado
  if (tipo === "orcamento") {
    const doc = await getDoc(cfg.table, id);
    if (doc && (doc.status === "Pendente" || doc.status === "Enviado")) {
      await setStatusDb(cfg.table, id, "Aprovado");
    }
  }

  revalidatePath("/", "layout");
  return { success: true };
}

/** Remove a assinatura do cliente de uma OS ou Orçamento */
export async function removerAssinaturaDoc(tipo, docId) {
  await requireSession();
  const cfg = DOCS[tipo];
  if (!cfg) return;
  const id = Number(docId);
  if (!id) return;

  await removerAssinaturaDocDb(cfg.table, id);
  revalidatePath("/", "layout");
}

/** Salva a assinatura da GF Dedetização (Técnico / Responsável) na OS ou Proposta */
export async function salvarAssinaturaGF(tipo, docId, formData) {
  await requireSession();
  const cfg = DOCS[tipo];
  if (!cfg) return { error: "Tipo de documento inválido." };
  const id = Number(docId);
  if (!id) return { error: "ID inválido." };

  const imagem = String(formData.get("imagem") || "");
  const nome = String(formData.get("nome") || "GF Dedetização - Técnico Responsável").trim().slice(0, 120);
  const salvarPadrao = formData.get("salvarPadrao") === "true" || formData.get("salvarPadrao") === "on";

  if (!imagem || !imagem.startsWith("data:image/png;base64,")) {
    return { error: "Por favor, faça a assinatura da GF no quadro antes de salvar." };
  }

  const em = formatarTimestampAssinatura();
  await saveAssinaturaGFDocDb(cfg.table, id, { imagem, nome, em });

  // Se solicitado, salva como assinatura padrão da empresa para novos documentos
  if (salvarPadrao) {
    await setConfig("assinatura_gf_padrao", JSON.stringify({ imagem, nome }));
  }

  revalidatePath("/", "layout");
  return { success: true };
}

/** Remove a assinatura da GF Dedetização do documento */
export async function removerAssinaturaGF(tipo, docId) {
  await requireSession();
  const cfg = DOCS[tipo];
  if (!cfg) return;
  const id = Number(docId);
  if (!id) return;

  await removerAssinaturaGFDocDb(cfg.table, id);
  revalidatePath("/", "layout");
}

/** Permite que o cliente assine a proposta ou OS pela página pública (/proposta/[id]) */
export async function salvarAssinaturaPublica(tipo, docId, formData) {
  const cfg = DOCS[tipo];
  if (!cfg) return { error: "Tipo de documento inválido." };
  const id = Number(docId);
  if (!id) return { error: "ID inválido." };

  const doc = await getDoc(cfg.table, id);
  if (!doc) return { error: "Documento não encontrado." };

  const imagem = String(formData.get("imagem") || "");
  const nome = String(formData.get("nome") || doc.cliente_nome || "").trim().slice(0, 120);
  const documento = String(formData.get("documento") || "").trim().slice(0, 40);

  if (!imagem || !imagem.startsWith("data:image/png;base64,")) {
    return { error: "Por favor, faça a sua assinatura na tela antes de confirmar." };
  }
  if (!nome || nome.length < 2) {
    return { error: "Por favor, informe seu nome completo." };
  }

  const em = formatarTimestampAssinatura();
  await saveAssinaturaDocDb(cfg.table, id, { imagem, nome, documento, em });

  // Se for proposta pendente/enviada, passa para Aprovado
  if (tipo === "orcamento" && (doc.status === "Pendente" || doc.status === "Enviado")) {
    await setStatusDb(cfg.table, id, "Aprovado");
  }

  revalidatePath("/", "layout");
  return { success: true };
}

// Aliases para compatibilidade com código existente
export async function salvarAssinaturaOS(osId, fd) {
  return await salvarAssinaturaDoc("os", osId, fd);
}

export async function removerAssinaturaOS(osId) {
  return await removerAssinaturaDoc("os", osId);
}

// ---------------------------------------------------- Envios Automáticos (WhatsApp & E-mail)

export async function enviarWhatsAppAutomatico(tipo, id) {
  await requireSession();
  const cfg = DOCS[tipo];
  if (!cfg) return { ok: false, error: "Tipo de documento inválido." };
  const numId = Number(id);
  const doc = await getDoc(cfg.table, numId);
  if (!doc) return { ok: false, error: "Documento não encontrado." };
  if (!doc.cliente_telefone) return { ok: false, error: "Cliente não possui telefone cadastrado." };

  const h = await headers();
  const host = h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const urlBase = `${proto}://${host}`;
  const pdfUrl = `${urlBase}/documento/${tipo}/${doc.id}`;
  const logoUrl = `${urlBase}/logo.png`;

  const texto = resumoTexto(tipo, doc, { negrito: true, urlBase });

  const res = await dispatchWhatsApp({
    telefone: doc.cliente_telefone,
    texto,
    mediaUrl: logoUrl,
    fileName: `logo_gf_dedetizacao.png`,
  });

  return res;
}

export async function enviarEmailAutomatico(tipo, id) {
  await requireSession();
  const cfg = DOCS[tipo];
  if (!cfg) return { ok: false, error: "Tipo de documento inválido." };
  const numId = Number(id);
  const doc = await getDoc(cfg.table, numId);
  if (!doc) return { ok: false, error: "Documento não encontrado." };
  if (!doc.cliente_email) return { ok: false, error: "Cliente não possui e-mail cadastrado." };

  const envUrl = (process.env.APP_URL || "").trim().replace(/\/+$/, "") ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  const h = await headers();
  const host = h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const requestUrlBase = `${proto}://${host}`;
  const urlBase = host.includes("localhost") && envUrl ? envUrl : requestUrlBase;
  const pdfUrl = `${urlBase}/documento/${tipo}/${doc.id}`;
  const logoUrl = `${urlBase}/logo.png`;

  const res = await dispatchEmail({
    destinatario: doc.cliente_email,
    nomeCliente: doc.cliente_nome,
    tipo,
    doc,
    pdfUrl,
    logoUrl,
  });

  return res;
}


import { BRAND, DOCS } from "./constants.js";
import { brl, dataBR, numero, waNumber } from "./format.js";

/** Texto-resumo de uma OS ou Proposta (para WhatsApp e e-mail). */
export function resumoTexto(tipo, doc, { negrito = true, urlBase = "" } = {}) {
  const cfg = DOCS[tipo];
  const b = (t) => (negrito ? `*${t}*` : t);
  const primeiro = (doc.cliente_nome || "").split(" ")[0];
  const linkDoc = urlBase ? `${urlBase}/documento/${tipo}/${doc.id}` : "";

  const linhas = [
    b(BRAND.nome),
    "",
    `Olá${primeiro ? `, ${primeiro}` : ""}! Segue o resumo da sua ${cfg.rotulo} nº ${numero(doc.id)}:`,
    "",
    `Data: ${dataBR(doc.data)}`,
    `Serviço: ${doc.servico}`,
  ];
  if (doc.produtos) linhas.push(`Produtos: ${doc.produtos}`);
  if (tipo === "orcamento") {
    if (doc.metodologia) linhas.push(`Metodologia: ${doc.metodologia}`);
    linhas.push(`Validade: ${dataBR(doc.validade)}`);
  }
  linhas.push(`Valor: ${b(brl(doc.valor))}`, `Status: ${doc.status}`);
  if (doc.assinatura_imagem) {
    linhas.push(`Assinatura: ${b("Assinado digitalmente")} por ${doc.assinatura_nome || doc.cliente_nome} (${doc.assinatura_em})`);
  }
  if (linkDoc) {
    linhas.push("", `📄 ${b("Visualizar / Baixar PDF Oficial:")}`, linkDoc);
  }
  linhas.push(
    "",
    BRAND.slogan,
    `Central de Atendimento: ${BRAND.telefone}`,
    `Instagram: @${BRAND.instagram}`,
  );
  return linhas.join("\n");
}

export function whatsappUrl(doc, texto) {
  const n = waNumber(doc.cliente_telefone);
  return `https://wa.me/${n}?text=${encodeURIComponent(texto)}`;
}

export function mailtoUrl(tipo, doc, texto) {
  const assunto = `${BRAND.nome} - ${DOCS[tipo].rotulo} nº ${numero(doc.id)}`;
  return `mailto:${encodeURIComponent(doc.cliente_email || "").replace(/%40/g, "@")}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(texto)}`;
}

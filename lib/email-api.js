import nodemailer from "nodemailer";
import fs from "node:fs";
import path from "node:path";
import { BRAND, DOCS } from "./constants.js";
import { brl, dataBR, numero } from "./format.js";

/**
 * Envia e-mail automático com alta entregabilidade (anti-spam otimizado):
 * - Multipart/alternative (HTML de alto contraste + Texto Puro alternativo obrigatório)
 * - Headers corporativos transacionais (Reply-To, X-Entity-Ref-ID, Auto-Submitted)
 * - Suporte a CID Attachment (Logo embutida nativamente no Gmail sem bloqueio de imagem)
 * - Assunto limpo sem caracteres especiais
 * - Proteção de autenticação SMTP e suporte a Resend API
 */
export async function dispatchEmail({ destinatario, nomeCliente, tipo, doc, pdfUrl, logoUrl }) {
  const cfg = DOCS[tipo];

  if (!destinatario || !destinatario.includes("@")) {
    return { ok: false, error: "Cliente não possui e-mail válido cadastrado." };
  }

  const isOrc = tipo === "orcamento";
  const numFormatado = numero(doc.id);
  const assunto = `${BRAND.nome} - Sua ${cfg.rotulo} Nº ${numFormatado}`;

  // Logo fallback pública em HTTPS para quando não puder usar anexo CID
  const publicLogoFallback =
    logoUrl && !logoUrl.includes("localhost")
      ? logoUrl
      : "https://raw.githubusercontent.com/PedroH2M/gf-dedetizacao-crm/main/public/logo.png";

  // Verifica se o logo local existe no servidor para anexo inline via CID
  const localLogoPath = path.join(process.cwd(), "public", "logo.png");
  const hasLocalLogo = fs.existsSync(localLogoPath);

  // 1. Versão em Texto Puro (OBRIGATÓRIO para evitar cair no filtro de SPAM)
  const textoPlano = `
Olá, ${nomeCliente}!

Segue a documentação oficial da sua ${cfg.rotulo} Nº ${numFormatado} emitida pela ${BRAND.nome}.

RESUMO DO DOCUMENTO:
- Documento: ${cfg.rotulo} Nº ${numFormatado}
- Status atual: ${doc.status}
- Data de emissão: ${dataBR(doc.data)}
- Serviço: ${doc.servico}
${doc.produtos ? `- Produtos utilizados: ${doc.produtos}\n` : ""}${isOrc && doc.validade ? `- Validade da proposta: ${dataBR(doc.validade)}\n` : ""}${isOrc && doc.metodologia ? `- Metodologia: ${doc.metodologia}\n` : ""}- ${isOrc ? "Valor da proposta:" : "Valor total:"} ${brl(doc.valor)}

${
  pdfUrl && !pdfUrl.includes("localhost")
    ? `Acesse o documento oficial com opção de imprimir ou salvar em PDF no link abaixo:\n${pdfUrl}\n\n`
    : ""
}Central de Atendimento: ${BRAND.telefone}
Instagram: @${BRAND.instagram}
${BRAND.slogan}

--------------------------------------------------
Você está recebendo este e-mail porque solicitou um orçamento ou serviço junto à ${BRAND.nome}.
`.trim();

  // 2. Versão em HTML com alto contraste e estrutura em tabela (máxima compatibilidade)
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${assunto}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <!-- Preheader oculto para visualização na caixa de entrada -->
  <div style="display:none;font-size:1px;color:#f4f6f8;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    Documento oficial da sua ${cfg.rotulo} Nº ${numFormatado} emitida pela ${BRAND.nome}.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f6f8;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background-color:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
          <!-- Topo com Logo -->
          <tr>
            <td style="background-color:#0d0d0d;padding:24px 20px;text-align:center;border-bottom:3px solid #39ff14;">
              <img src="${publicLogoFallback}" alt="GF Dedetização" width="180" style="max-height:65px;width:auto;display:block;margin:0 auto;border:0;" />
            </td>
          </tr>

          <!-- Corpo Principal -->
          <tr>
            <td style="padding:28px 24px;color:#1f2937;line-height:1.6;font-size:15px;">
              <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#111827;">Olá, ${nomeCliente}!</p>
              <p style="margin:0 0 20px;color:#4b5563;">
                Segue a documentação oficial da sua <strong>${cfg.rotulo} Nº ${numFormatado}</strong> emitida pela <strong>${BRAND.nome}</strong>.
              </p>

              <!-- Card com Detalhes -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:20px 0;">
                <tr>
                  <td colspan="2" style="padding-bottom:12px;">
                    <span style="display:inline-block;background-color:#ecfdf5;color:#047857;padding:4px 12px;border-radius:999px;font-weight:700;font-size:12px;text-transform:uppercase;border:1px solid #a7f3d0;">
                      ${doc.status}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:14px;">Data de emissão:</td>
                  <td align="right" style="padding:6px 0;border-bottom:1px solid #f3f4f6;font-weight:600;color:#111827;font-size:14px;">${dataBR(doc.data)}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:14px;">Serviço:</td>
                  <td align="right" style="padding:6px 0;border-bottom:1px solid #f3f4f6;font-weight:600;color:#111827;font-size:14px;">${doc.servico}</td>
                </tr>
                ${
                  doc.produtos
                    ? `
                <tr>
                  <td style="padding:6px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:14px;">Produtos utilizados:</td>
                  <td align="right" style="padding:6px 0;border-bottom:1px solid #f3f4f6;font-weight:600;color:#111827;font-size:14px;">${doc.produtos}</td>
                </tr>`
                    : ""
                }
                ${
                  isOrc && doc.validade
                    ? `
                <tr>
                  <td style="padding:6px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:14px;">Validade da proposta:</td>
                  <td align="right" style="padding:6px 0;border-bottom:1px solid #f3f4f6;font-weight:600;color:#111827;font-size:14px;">${dataBR(doc.validade)}</td>
                </tr>`
                    : ""
                }
                ${
                  isOrc && doc.metodologia
                    ? `
                <tr>
                  <td style="padding:6px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:14px;">Metodologia:</td>
                  <td align="right" style="padding:6px 0;border-bottom:1px solid #f3f4f6;font-weight:600;color:#111827;font-size:14px;">${doc.metodologia}</td>
                </tr>`
                    : ""
                }
                <tr>
                  <td style="padding-top:12px;color:#111827;font-size:15px;font-weight:700;">${isOrc ? "Valor da proposta:" : "Valor total:"}</td>
                  <td align="right" style="padding-top:12px;color:#047857;font-size:20px;font-weight:800;">${brl(doc.valor)}</td>
                </tr>
              </table>

              <!-- Botão de Ação -->
              ${
                pdfUrl
                  ? `
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:22px 0 10px;">
                <tr>
                  <td align="center">
                    <a href="${pdfUrl}" target="_blank" style="display:inline-block;width:100%;box-sizing:border-box;text-align:center;background-color:#0d0d0d;color:#39ff14;font-weight:800;padding:14px 24px;border-radius:8px;text-decoration:none;font-size:15px;border:2px solid #39ff14;">
                      Visualizar Proposta Oficial em PDF
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
                Clique no botão acima para abrir a proposta oficial no seu navegador ou salvar o PDF.
              </p>
              `
                  : ""
              }
            </td>
          </tr>

          <!-- Rodapé Institucional -->
          <tr>
            <td style="background-color:#f9fafb;padding:20px 24px;text-align:center;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;line-height:1.5;">
              <p style="margin:0 0 4px;font-weight:700;color:#111827;">${BRAND.nome}</p>
              <p style="margin:0 0 6px;color:#4b5563;">${BRAND.slogan}</p>
              <p style="margin:0 0 8px;color:#6b7280;">
                Central de Atendimento: <strong>${BRAND.telefone}</strong> • Instagram: <strong>@${BRAND.instagram}</strong>
              </p>
              <p style="margin:12px 0 0;font-size:11px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:10px;">
                Você está recebendo este e-mail porque solicitou um orçamento ou serviço junto à ${BRAND.nome}.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  // Opção 1: Envio via SMTP (Gmail, Brevo, Outlook, etc.)
  const smtpUser = (process.env.SMTP_USER || "").trim();
  const smtpPass = (process.env.SMTP_PASS || "").trim();

  if (smtpUser && smtpPass) {
    try {
      const host = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
      const port = Number(process.env.SMTP_PORT) || 465;

      // Importante para entregabilidade no Gmail: o FROM deve coincidir com a conta autenticada
      const isGmail = host.includes("gmail") || smtpUser.endsWith("@gmail.com");
      const fromEmail = isGmail ? smtpUser : (process.env.EMAIL_FROM_ADDRESS || smtpUser);
      const fromName = (process.env.EMAIL_FROM_NAME || BRAND.nome).replace(/["<>]/g, "");
      const from = `"${fromName}" <${fromEmail}>`;
      const replyTo = (process.env.EMAIL_REPLY_TO || smtpUser).trim();

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const attachments = [];
      let finalHtml = html;

      // Anexa a imagem inline via CID para renderizar instantaneamente sem avisos de segurança
      if (hasLocalLogo) {
        attachments.push({
          filename: "logo.png",
          path: localLogoPath,
          cid: "gf_logo_cid@crm",
        });
        finalHtml = html.replace(publicLogoFallback, "cid:gf_logo_cid@crm");
      }

      const info = await transporter.sendMail({
        from,
        to: destinatario,
        replyTo,
        subject: assunto,
        text: textoPlano,
        html: finalHtml,
        headers: {
          "X-Entity-Ref-ID": `${tipo}-${doc.id}-${Date.now()}`,
          "Auto-Submitted": "auto-generated",
          "X-Priority": "3",
        },
        attachments: attachments.length ? attachments : undefined,
      });

      return { ok: true, data: info };
    } catch (smtpErr) {
      return { ok: false, error: `Falha no envio via SMTP: ${smtpErr.message}` };
    }
  }

  // Opção 2: Envio via Resend API
  const resendApiKey = (process.env.RESEND_API_KEY || "").trim();
  const resendFrom = (process.env.EMAIL_FROM || "GF Dedetização <onboarding@resend.dev>").trim();

  if (resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: resendFrom,
          to: [destinatario],
          reply_to: process.env.EMAIL_REPLY_TO || undefined,
          subject: assunto,
          html,
          text: textoPlano,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const rawMsg = errJson.message || "";

        if (rawMsg.includes("verify a domain") || rawMsg.includes("testing emails to your own")) {
          return {
            ok: false,
            needsDomain: true,
            error:
              "O Resend em modo de teste só permite envio para o seu e-mail próprio. Para enviar para clientes, use o SMTP do Gmail ou cadastre seu domínio no Resend.",
          };
        }

        return { ok: false, error: `Erro no provedor de e-mail (${res.status}): ${rawMsg}` };
      }

      const data = await res.json().catch(() => ({}));
      return { ok: true, data };
    } catch (err) {
      return { ok: false, error: `Falha na conexão de envio de e-mail: ${err.message}` };
    }
  }

  return {
    ok: false,
    unconfigured: true,
    error: "Provedor de e-mail não configurado. Defina SMTP_USER e SMTP_PASS (Gmail) ou RESEND_API_KEY.",
    previewSubject: assunto,
  };
}

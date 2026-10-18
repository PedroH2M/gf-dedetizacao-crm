import { BRAND, DOCS } from "./constants.js";
import { brl, dataBR, numero } from "./format.js";

/**
 * Envia e-mail no-reply automático com logo e proposta em PDF para o cliente.
 * Suporta Resend (padrão Vercel/Next.js, gratuito 3.000 e-mails/mês).
 */
export async function dispatchEmail({ destinatario, nomeCliente, tipo, doc, pdfUrl, logoUrl }) {
  const apiKey = (process.env.RESEND_API_KEY || "").trim();
  const fromEmail = (process.env.EMAIL_FROM || "GF Dedetização <onboarding@resend.dev>").trim();
  const cfg = DOCS[tipo];

  if (!destinatario || !destinatario.includes("@")) {
    return { ok: false, error: "Cliente não possui e-mail válido cadastrado." };
  }

  const isOrc = tipo === "orcamento";
  const numFormatado = numero(doc.id);
  const assunto = `${BRAND.nome} • Sua ${cfg.rotulo} Nº ${numFormatado}`;

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #121212; color: #ffffff; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-radius: 12px; border: 1px solid #2a2a2a; overflow: hidden; }
    .header { background: #000; padding: 24px; text-align: center; border-bottom: 3px solid #39ff14; }
    .logo { max-height: 75px; margin: 0 auto; display: block; border-radius: 6px; }
    .content { padding: 24px; line-height: 1.6; }
    .badge { display: inline-block; background: rgba(57, 255, 20, 0.15); color: #39ff14; padding: 4px 10px; border-radius: 999px; font-weight: bold; font-size: 13px; }
    .card { background: #121212; border: 1px solid #2a2a2a; border-radius: 8px; padding: 16px; margin: 20px 0; }
    .row { display: flex; justify-content: space-between; border-bottom: 1px solid #222; padding: 8px 0; }
    .row:last-child { border-bottom: none; }
    .label { color: #888; font-size: 14px; }
    .val { font-weight: bold; font-size: 14px; color: #fff; text-align: right; }
    .total { font-size: 20px; color: #39ff14; font-weight: 900; }
    .btn { display: inline-block; width: 100%; box-sizing: border-box; text-align: center; background: #39ff14; color: #000; font-weight: 900; padding: 14px 20px; border-radius: 8px; text-decoration: none; margin: 20px 0 10px; font-size: 16px; }
    .footer { padding: 20px 24px; background: #0a0a0a; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #222; }
    .slogan { color: #aaa; margin-bottom: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${logoUrl || 'https://raw.githubusercontent.com/PedroH2M/gf-dedetizacao-crm/main/public/logo.png'}" alt="GF Dedetização" class="logo" />
    </div>
    <div class="content">
      <p style="font-size: 18px; margin-top: 0;">Olá, <strong>${nomeCliente}</strong>!</p>
      <p>Segue a documentação oficial da sua <strong>${cfg.rotulo} Nº ${numFormatado}</strong> emitida pela <strong>GF Dedetização</strong>.</p>
      
      <div class="card">
        <div style="margin-bottom: 12px;">
          <span class="badge">${doc.status}</span>
        </div>
        <div class="row">
          <span class="label">Data de emissão:</span>
          <span class="val">${dataBR(doc.data)}</span>
        </div>
        <div class="row">
          <span class="label">Serviço:</span>
          <span class="val">${doc.servico}</span>
        </div>
        ${doc.produtos ? `
        <div class="row">
          <span class="label">Produtos utilizados:</span>
          <span class="val">${doc.produtos}</span>
        </div>` : ''}
        ${isOrc && doc.validade ? `
        <div class="row">
          <span class="label">Validade da proposta:</span>
          <span class="val">${dataBR(doc.validade)}</span>
        </div>` : ''}
        ${isOrc && doc.metodologia ? `
        <div class="row">
          <span class="label">Metodologia:</span>
          <span class="val">${doc.metodologia}</span>
        </div>` : ''}
        <div class="row" style="padding-top: 12px; margin-top: 6px;">
          <span class="label" style="font-size: 16px; color: #fff;">${isOrc ? 'Valor da proposta:' : 'Valor total:'}</span>
          <span class="val total">${brl(doc.valor)}</span>
        </div>
      </div>

      ${pdfUrl ? `
      <a href="${pdfUrl}" target="_blank" class="btn">
        📄 Visualizar e Baixar Proposta em PDF
      </a>
      <p style="font-size: 12px; color: #777; text-align: center; margin: 0;">
        Clique no botão acima para visualizar o documento oficial com opção de imprimir ou salvar em PDF.
      </p>
      ` : ''}
    </div>

    <div class="footer">
      <div class="slogan"><strong>${BRAND.slogan}</strong></div>
      <div>${BRAND.slogan2}</div>
      <div style="margin-top: 8px;">
        Central de Atendimento: <strong>${BRAND.telefone}</strong> • Instagram: <strong>@${BRAND.instagram}</strong>
      </div>
      <div style="margin-top: 10px; font-size: 11px; color: #555;">
        E-mail automático enviado pela plataforma GF Dedetização CRM.
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  if (apiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [destinatario],
          subject: assunto,
          html,
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        return { ok: false, error: `Erro no provedor de e-mail (${res.status}): ${errText.slice(0, 160)}` };
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
    error: "Provedor de envio de e-mail não configurado (defina RESEND_API_KEY nas variáveis de ambiente da Vercel).",
    previewSubject: assunto,
  };
}

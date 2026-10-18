import { digits } from "./format.js";

/**
 * Envia mensagem automática pelo WhatsApp através de Gateway REST (Evolution API, Z-API ou Webhook).
 * Conecta o WhatsApp da GF Dedetização para envio direto sem precisar abrir o app no celular.
 */
export async function dispatchWhatsApp({ telefone, texto, mediaUrl, fileName }) {
  const apiUrl = (process.env.WHATSAPP_API_URL || "").trim().replace(/\/$/, "");
  const apiKey = (process.env.WHATSAPP_API_KEY || "").trim();
  const instance = (process.env.WHATSAPP_INSTANCE || "gfdedetizacao").trim();

  // Formata telefone para padrão internacional (DDI 55 + DDD + Número)
  let cleanNumber = digits(telefone);
  if (cleanNumber.length === 10 || cleanNumber.length === 11) {
    cleanNumber = `55${cleanNumber}`;
  }

  if (!cleanNumber || cleanNumber.length < 12) {
    return { ok: false, error: "Número de telefone do cliente é inválido para envio de WhatsApp." };
  }

  // Se nenhuma API de WhatsApp foi configurada no ambiente
  if (!apiUrl) {
    return {
      ok: false,
      unconfigured: true,
      error: "API de WhatsApp não configurada nas variáveis de ambiente (defina WHATSAPP_API_URL e WHATSAPP_API_KEY).",
    };
  }

  try {
    // 1. Se houver mídia (PDF da proposta ou imagem da logo), tenta envio de mídia primeiro
    if (mediaUrl) {
      const mediaEndpoint = `${apiUrl}/message/sendMedia/${instance}`;
      try {
        const mediaRes = await fetch(mediaEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: apiKey,
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            number: cleanNumber,
            media: mediaUrl,
            mediatype: mediaUrl.endsWith(".pdf") ? "document" : "image",
            caption: texto,
            fileName: fileName || "proposta_gf_dedetizacao.pdf",
          }),
        });
        if (mediaRes.ok) {
          const json = await mediaRes.json().catch(() => ({}));
          return { ok: true, data: json };
        }
      } catch (e) {
        // Se envio de mídia falhar, tenta fallback para mensagem de texto normal
        console.warn("Falha no envio de mídia via WhatsApp API, tentando texto:", e.message);
      }
    }

    // 2. Envio de mensagem de texto (padrão Evolution API / Z-API compatível)
    const textEndpoint = `${apiUrl}/message/sendText/${instance}`;
    const res = await fetch(textEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        number: cleanNumber,
        text: texto,
        linkPreview: true,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return { ok: false, error: `Erro retornado pelo gateway WhatsApp (${res.status}): ${errText.slice(0, 160)}` };
    }

    const data = await res.json().catch(() => ({}));
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: `Falha na conexão com a API de WhatsApp: ${err.message}` };
  }
}

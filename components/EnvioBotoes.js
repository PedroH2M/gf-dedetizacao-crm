"use client";

import { useState, useTransition } from "react";
import Icon from "./Icon";
import { enviarEmailAutomatico, enviarWhatsAppAutomatico } from "@/app/actions";

export default function EnvioBotoes({
  tipo,
  doc,
  whatsappFallbackUrl,
  emailFallbackUrl,
  printUrl,
}) {
  const [isPending, startTransition] = useTransition();
  const [loadingType, setLoadingType] = useState(null); // 'whatsapp' | 'email'
  const [statusMsg, setStatusMsg] = useState(null);
  const [modalApi, setModalApi] = useState(null);

  const handleWhatsAppAutomatico = (e) => {
    e.preventDefault();
    setStatusMsg(null);
    setLoadingType("whatsapp");
    startTransition(async () => {
      try {
        const res = await enviarWhatsAppAutomatico(tipo, doc.id);
        if (res.ok) {
          setStatusMsg({
            type: "success",
            text: "✓ Mensagem com proposta em PDF enviada com sucesso no WhatsApp do cliente!",
          });
        } else if (res.unconfigured) {
          setModalApi("whatsapp");
        } else {
          setStatusMsg({
            type: "error",
            text: res.error || "Erro ao conectar com a API do WhatsApp.",
            fallback: "whatsapp",
          });
        }
      } catch (err) {
        setStatusMsg({
          type: "error",
          text: `Erro ao enviar: ${err.message}`,
          fallback: "whatsapp",
        });
      } finally {
        setLoadingType(null);
      }
    });
  };

  const handleEmailAutomatico = (e) => {
    e.preventDefault();
    setStatusMsg(null);
    setLoadingType("email");
    startTransition(async () => {
      try {
        const res = await enviarEmailAutomatico(tipo, doc.id);
        if (res.ok) {
          setStatusMsg({
            type: "success",
            text: `✓ E-mail no-reply com a proposta em PDF e logotipo enviado para ${doc.cliente_email}!`,
          });
        } else if (res.unconfigured) {
          setModalApi("email");
        } else {
          setStatusMsg({
            type: "error",
            text: res.error || "Erro ao disparar e-mail.",
            fallback: "email",
          });
        }
      } catch (err) {
        setStatusMsg({
          type: "error",
          text: `Erro ao enviar e-mail: ${err.message}`,
          fallback: "email",
        });
      } finally {
        setLoadingType(null);
      }
    });
  };

  return (
    <div className="space-y-3">
      {/* Botões de Ação */}
      <div className="grid grid-cols-3 gap-2.5">
        <a
          id="btn-whatsapp"
          href={whatsappFallbackUrl}
          onClick={handleWhatsAppAutomatico}
          className="btn btn-primary !flex-col !gap-1.5 !px-2 !py-3 !text-sm cursor-pointer"
          title="Clique para enviar automaticamente via WhatsApp ou abra diretamente"
        >
          {loadingType === "whatsapp" ? (
            <span className="animate-spin text-xl">⏳</span>
          ) : (
            <Icon name="whatsapp" size={24} />
          )}
          <span>WhatsApp</span>
        </a>

        <a
          id="btn-email"
          href={emailFallbackUrl}
          onClick={handleEmailAutomatico}
          className="btn btn-outline !flex-col !gap-1.5 !px-2 !py-3 !text-sm cursor-pointer"
          title="Disparo automático de e-mail no-reply com proposta em PDF"
        >
          {loadingType === "email" ? (
            <span className="animate-spin text-xl">⏳</span>
          ) : (
            <Icon name="mail" size={24} />
          )}
          <span>E-mail</span>
        </a>

        <a
          id="btn-pdf"
          href={printUrl}
          className="btn btn-outline !flex-col !gap-1.5 !px-2 !py-3 !text-sm"
        >
          <Icon name="printer" size={24} />
          <span>Imprimir / PDF</span>
        </a>
      </div>

      {/* Alerta de Feedback de Envio */}
      {statusMsg && (
        <div
          role="alert"
          className={`rounded-xl border p-3.5 text-sm transition-all ${
            statusMsg.type === "success"
              ? "border-brand-green/40 bg-brand-green/10 text-brand-green"
              : "border-red-500/40 bg-red-500/10 text-red-200"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold leading-snug">{statusMsg.text}</p>
            <button
              type="button"
              onClick={() => setStatusMsg(null)}
              className="text-xs opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
          {statusMsg.fallback === "whatsapp" && (
            <a
              href={whatsappFallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-brand-green underline"
            >
              <Icon name="whatsapp" size={14} /> Abrir no WhatsApp Manualmente como alternativa
            </a>
          )}
          {statusMsg.fallback === "email" && (
            <a
              href={emailFallbackUrl}
              className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-neutral-200 underline"
            >
              <Icon name="mail" size={14} /> Abrir cliente de e-mail manualmente
            </a>
          )}
        </div>
      )}

      {/* Modal de Configuração da API do WhatsApp */}
      {modalApi === "whatsapp" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="card w-full max-w-md border-brand-green/30 !p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2 text-brand-green">
                <Icon name="whatsapp" size={22} />
                <h3 className="text-base font-black">Conexão da API do WhatsApp</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalApi(null)}
                className="text-muted hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 space-y-3 text-sm text-neutral-300">
              <p>
                O sistema já tem a infraestrutura pronta para envio 100% automático (sem precisar abrir o WhatsApp).
              </p>
              <div className="rounded-lg bg-black/40 p-3 text-xs">
                <p className="font-bold text-white">Para ativar o envio direto no WhatsApp:</p>
                <p className="mt-1 text-muted">
                  Basta configurar na Vercel (ou no arquivo <code className="text-brand-green">.env.local</code>):
                </p>
                <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-neutral-300">
                  <li><code className="text-white">WHATSAPP_API_URL</code> (ex: Evolution API ou Z-API)</li>
                  <li><code className="text-white">WHATSAPP_API_KEY</code> (chave da sua instância)</li>
                  <li><code className="text-white">WHATSAPP_INSTANCE</code> (nome da instância)</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <a
                href={whatsappFallbackUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setModalApi(null)}
                className="btn btn-primary w-full text-center font-bold"
              >
                <Icon name="whatsapp" size={18} /> Abrir no WhatsApp Agora (Envio Manual)
              </a>
              <button
                type="button"
                onClick={() => setModalApi(null)}
                className="btn btn-outline w-full text-center"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configuração de E-mail */}
      {modalApi === "email" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="card w-full max-w-md border-line !p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2 text-white">
                <Icon name="mail" size={22} />
                <h3 className="text-base font-black">Disparo Automático de E-mail</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalApi(null)}
                className="text-muted hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 space-y-3 text-sm text-neutral-300">
              <p>
                O modelo de e-mail com logotipo da GF Dedetização e botão para o PDF da proposta está pronto!
              </p>
              <div className="rounded-lg bg-black/40 p-3 text-xs">
                <p className="font-bold text-white">Para ativar o disparo no-reply gratuito:</p>
                <p className="mt-1 text-muted">
                  Crie uma chave gratuita no <a href="https://resend.com" target="_blank" className="text-brand-green underline">Resend.com</a> (grátis 3.000 e-mails/mês) e adicione nas variáveis de ambiente:
                </p>
                <p className="mt-1.5"><code className="text-brand-green">RESEND_API_KEY=re_123456...</code></p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <a
                href={emailFallbackUrl}
                onClick={() => setModalApi(null)}
                className="btn btn-primary w-full text-center font-bold"
              >
                <Icon name="mail" size={18} /> Abrir no Meu E-mail (Manual)
              </a>
              <button
                type="button"
                onClick={() => setModalApi(null)}
                className="btn btn-outline w-full text-center"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

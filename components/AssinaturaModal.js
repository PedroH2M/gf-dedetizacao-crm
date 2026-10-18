"use client";

import { useState, useRef, useEffect } from "react";
import Icon from "./Icon";
import { salvarAssinaturaOS, removerAssinaturaOS } from "@/app/actions";

export default function AssinaturaModal({ osId, clienteNome, assinaturaAtual }) {
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState(clienteNome || "");
  const [documento, setDocumento] = useState("");
  const [desenhando, setDesenhando] = useState(false);
  const [temTraco, setTemTraco] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const canvasRef = useRef(null);
  const isPointerDownRef = useRef(false);

  // Inicializa o canvas quando o modal abrir
  useEffect(() => {
    if (!aberto) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    // Suporte a telas de alta resolução (Retina / Mobile)
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Configurações do traço de caneta
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    setTemTraco(false);
    setErro("");
  }, [aberto]);

  function getCoordenadas(e) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function handlePointerDown(e) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    isPointerDownRef.current = true;
    setDesenhando(true);
    setErro("");

    const ctx = canvas.getContext("2d");
    const { x, y } = getCoordenadas(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function handlePointerMove(e) {
    if (!isPointerDownRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const { x, y } = getCoordenadas(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setTemTraco(true);
  }

  function handlePointerUp(e) {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    setDesenhando(false);
    try {
      e.target.releasePointerCapture(e.pointerId);
    } catch {}
  }

  function limparCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setTemTraco(false);
    setErro("");
  }

  async function handleSalvar(e) {
    e.preventDefault();
    if (!temTraco) {
      setErro("Por favor, faça a assinatura na tela antes de salvar.");
      return;
    }
    if (!nome.trim()) {
      setErro("Informe o nome de quem está assinando.");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    setSalvando(true);
    setErro("");

    try {
      const dataUrl = canvas.toDataURL("image/png");
      const fd = new FormData();
      fd.append("imagem", dataUrl);
      fd.append("nome", nome.trim());
      fd.append("documento", documento.trim());

      const res = await salvarAssinaturaOS(osId, fd);
      if (res?.error) {
        setErro(res.error);
        setSalvando(false);
      } else {
        setAberto(false);
        setSalvando(false);
      }
    } catch (err) {
      setErro("Erro ao salvar assinatura. Tente novamente.");
      setSalvando(false);
    }
  }

  async function handleRemover() {
    if (!window.confirm("Deseja remover a assinatura digital desta OS?")) return;
    setSalvando(true);
    try {
      await removerAssinaturaOS(osId);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      {/* Visualização quando JÁ possui assinatura */}
      {assinaturaAtual ? (
        <div className="card space-y-3 border-brand-green/30">
          <div className="flex items-center justify-between border-b border-line pb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-green/20 text-brand-green">
                <Icon name="check" size={14} />
              </span>
              <p className="text-xs font-black uppercase tracking-wider text-brand-green">
                Assinado Digitalmente
              </p>
            </div>
            <span className="text-xs font-medium text-muted">{assinaturaAtual.em}</span>
          </div>

          {/* Imagem da assinatura em fundo branco com bordas arredondadas */}
          <div className="flex min-h-[90px] items-center justify-center rounded-xl bg-white p-3 shadow-inner">
            <img
              src={assinaturaAtual.imagem}
              alt={`Assinatura de ${assinaturaAtual.nome}`}
              className="max-h-24 w-auto object-contain select-none"
            />
          </div>

          <div className="flex items-end justify-between pt-1">
            <div className="min-w-0 pr-2">
              <p className="label !mb-0.5">Assinado por</p>
              <p className="truncate text-base font-bold text-white">{assinaturaAtual.nome}</p>
              {assinaturaAtual.documento && (
                <p className="text-xs text-muted">Doc: {assinaturaAtual.documento}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAberto(true)}
                className="btn btn-ghost btn-sm !px-2.5 !text-xs font-bold"
                title="Refazer assinatura"
              >
                <Icon name="pen" size={15} /> Refazer
              </button>
              <button
                type="button"
                onClick={handleRemover}
                disabled={salvando}
                className="btn btn-danger btn-sm !px-2.5 !text-xs font-bold"
                title="Excluir assinatura"
              >
                <Icon name="trash" size={15} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Visualização quando AINDA NÃO possui assinatura */
        <div className="card space-y-3 border-dashed border-line">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-green/15 text-brand-green">
              <Icon name="pen" size={24} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-white">Assinatura do Cliente</h2>
              <p className="text-xs text-muted">Colete a assinatura digital do cliente na tela do celular.</p>
            </div>
          </div>

          <button
            id="btn-coletar-assinatura"
            type="button"
            onClick={() => setAberto(true)}
            className="btn btn-primary btn-block"
          >
            <Icon name="pen" size={18} /> Coletar Assinatura Agora
          </button>
        </div>
      )}

      {/* Modal / Overlay para Assinar na Tela */}
      {aberto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in"
        >
          <div className="relative w-full max-w-lg rounded-t-2xl sm:rounded-2xl border border-line bg-surface p-4 sm:p-6 shadow-2xl max-h-[96dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-green/15 text-brand-green">
                  <Icon name="pen" size={18} />
                </span>
                <div>
                  <h2 className="text-lg font-black text-white">Assinatura Digital</h2>
                  <p className="text-xs text-muted">Peça para o cliente assinar com o dedo abaixo</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAberto(false)}
                className="icon-btn !h-9 !w-9"
                aria-label="Fechar"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            {erro && (
              <p role="alert" className="alert alert-error mb-3">
                {erro}
              </p>
            )}

            <form onSubmit={handleSalvar} className="space-y-4">
              <div>
                <label htmlFor="assinatura-nome" className="label">
                  Nome legível de quem está assinando *
                </label>
                <input
                  id="assinatura-nome"
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome completo do responsável"
                  className="input !min-h-[2.8rem]"
                />
              </div>

              <div>
                <label htmlFor="assinatura-doc" className="label">
                  Documento (RG ou CPF) - opcional
                </label>
                <input
                  id="assinatura-doc"
                  type="text"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  placeholder="Ex.: 12.345.678-9 ou 123.456.789-00"
                  className="input !min-h-[2.8rem]"
                />
              </div>

              {/* Área do Canvas de Assinatura */}
              <div>
                <div className="flex items-center justify-between mb-1.5 px-0.5">
                  <span className="label !mb-0">Espaço para assinatura *</span>
                  <button
                    type="button"
                    onClick={limparCanvas}
                    className="text-xs font-bold text-brand-green hover:underline active:opacity-70"
                  >
                    Limpar tela
                  </button>
                </div>

                <div className="relative overflow-hidden rounded-xl border-2 border-line bg-white shadow-inner">
                  <canvas
                    ref={canvasRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    style={{
                      touchAction: "none",
                      width: "100%",
                      height: "200px",
                      display: "block",
                      cursor: "crosshair",
                    }}
                  />
                  {/* Linha guia para assinar */}
                  <div className="pointer-events-none absolute bottom-10 left-6 right-6 border-b border-dashed border-neutral-300 flex justify-between text-[11px] font-semibold text-neutral-400 pb-1">
                    <span>X</span>
                    <span>Assine acima desta linha</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAberto(false)}
                  className="btn btn-ghost"
                  disabled={salvando}
                >
                  Cancelar
                </button>
                <button
                  id="btn-confirmar-assinatura"
                  type="submit"
                  className="btn btn-primary"
                  disabled={salvando}
                >
                  {salvando ? "Salvando..." : "Confirmar Assinatura"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

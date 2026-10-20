import Link from "next/link";
import { notFound } from "next/navigation";
import PrintButton from "./PrintButton";
import Icon from "./Icon";
import { BRAND } from "@/lib/constants";
import { brl, dataBR, numero } from "@/lib/format";
import { getDoc, getConfig } from "@/lib/queries";
import AssinaturaModal from "./AssinaturaModal";

/**
 * Proposta Comercial e Ordem de Serviço em estilo A4 corporativo de alta fidelidade
 * baseado na identidade visual oficial da GF Dedetização.
 */
export default async function PrintDoc({ cfg, id, isPublic = false }) {
  const numId = Number(id);
  if (!Number.isFinite(numId) || numId <= 0) notFound();
  const doc = await getDoc(cfg.table, numId);
  if (!doc) notFound();

  const isOrc = cfg.tipo === "orcamento";
  const numFormatado = numero(doc.id);
  const tituloDoc = isOrc ? "PROPOSTA COMERCIAL" : "ORDEM DE SERVIÇO";

  // Identificação da assinatura da GF Dedetização (documento específico ou padrão da empresa)
  let gfAssinatura = null;
  if (doc.assinatura_gf_imagem) {
    gfAssinatura = {
      imagem: doc.assinatura_gf_imagem,
      nome: doc.assinatura_gf_nome || "GF Dedetização - Técnico Responsável",
      em: doc.assinatura_gf_em,
    };
  } else {
    const padraoJson = await getConfig("assinatura_gf_padrao");
    if (padraoJson) {
      try {
        const p = JSON.parse(padraoJson);
        if (p?.imagem) {
          gfAssinatura = {
            imagem: p.imagem,
            nome: p.nome || "GF Dedetização - Técnico Responsável",
            em: null,
          };
        }
      } catch {}
    }
  }

  // Identificação do endereço / área estimada
  const areaEstimada =
    doc.cliente_endereco ||
    (doc.metodologia && doc.metodologia.toLowerCase().includes("área")
      ? doc.metodologia
      : "Toda a área comum e privativa do imóvel");

  // Garantia comercial
  const garantiaTexto = doc.observacoes && doc.observacoes.toLowerCase().includes("garantia")
    ? doc.observacoes
    : "(03) MESES";

  return (
    <div className="sheet min-h-screen bg-neutral-100 text-[#111827] print:bg-white print:p-0">
      {/* Barra de Ações Superior (Não impressa) */}
      <div className="no-print sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-neutral-300 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
        {isPublic ? (
          <a
            href={BRAND.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#25D366] px-4 py-1.5 text-sm font-black text-white hover:brightness-105"
          >
            <Icon name="whatsapp" size={18} /> Falar no WhatsApp ({BRAND.telefone})
          </a>
        ) : (
          <Link
            href={`/${cfg.rota}/${doc.id}`}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-neutral-300 bg-neutral-100 px-3.5 py-1.5 text-sm font-bold text-neutral-800 hover:bg-neutral-200"
          >
            <Icon name="back" size={18} /> Voltar ao CRM
          </Link>
        )}

        <div className="flex items-center gap-2">
          <PrintButton />
        </div>
      </div>

      {/* Folha A4 do Documento */}
      <div className="mx-auto my-4 max-w-[850px] bg-white p-6 shadow-xl print:my-0 print:max-w-none print:p-0 print:shadow-none sm:p-10">
        <article className="proposta-container font-sans text-[#1f2937]">
          {/* 1. TOPO: Banner Escuro Oficial */}
          <header className="proposta-banner flex flex-wrap items-center justify-between gap-4 rounded-t-sm bg-[#1e2420] px-6 py-5 text-white print:rounded-none">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="GF Dedetização"
                className="block h-14 w-auto max-h-16 object-contain"
              />
            </div>
            <div className="text-right">
              <div className="text-lg font-extrabold leading-tight text-white sm:text-xl">
                Seu ambiente protegido,
              </div>
              <div className="text-lg font-extrabold leading-tight text-[#22c55e] sm:text-xl">
                com qualidade e segurança.
              </div>
              <div className="mt-2 text-[9px] font-bold tracking-[0.2em] text-neutral-300 uppercase">
                RESIDÊNCIAS • COMÉRCIOS • INDÚSTRIAS • EMPRESAS
              </div>
            </div>
          </header>

          <div className="px-1 pt-6 sm:px-2">
            {/* 2. TÍTULO DO DOCUMENTO */}
            <div className="flex flex-wrap items-baseline justify-between border-b-2 border-neutral-200 pb-3">
              <h1 className="text-2xl font-black tracking-tight text-[#111827] sm:text-3xl">
                {tituloDoc}
              </h1>
              <div className="text-right text-xs font-bold text-neutral-500">
                <span>Nº {numFormatado}</span> • <span>Emissão: {dataBR(doc.data)}</span>
              </div>
            </div>

            {/* 3. APRESENTAÇÃO + PRINCIPAIS PRAGAS (2 Colunas) */}
            <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-12">
              {/* Coluna Esquerda: Texto de Apresentação */}
              <div className="space-y-3 md:col-span-7">
                <h2 className="text-lg font-extrabold text-[#16a34a]">
                  Olá{doc.cliente_nome ? `, ${doc.cliente_nome}` : ""}!
                </h2>
                <p className="text-xs leading-relaxed text-neutral-600">
                  A <strong>GF Dedetizações</strong> tem o prazer de apresentar esta proposta
                  comercial, desenvolvida especialmente para atender às necessidades do seu ambiente.
                  Nosso objetivo é oferecer soluções eficazes e seguras no controle de pragas,
                  garantindo mais saúde, bem-estar e tranquilidade para sua família ou seu negócio.
                </p>
                <p className="text-xs leading-relaxed text-neutral-600">
                  Trabalhamos com profissionais qualificados, produtos regularizados e total
                  compromisso com a sua satisfação.
                </p>
                <p className="text-xs font-black text-[#16a34a]">
                  Conte com a GF Dedetizações!
                </p>
              </div>

              {/* Coluna Direita: Box de Pragas Controladas */}
              <div className="rounded border border-[#e2e8e5] bg-[#f4f7f5] p-3.5 md:col-span-5">
                <h3 className="mb-2.5 text-[11px] font-black tracking-wider text-neutral-800 uppercase">
                  PRINCIPAIS PRAGAS QUE CONTROLAMOS
                </h3>
                <ul className="space-y-2 text-[11px]">
                  <li className="flex items-start gap-1.5">
                    <span className="mt-0.5 text-xs text-[#16a34a]">◆</span>
                    <div>
                      <strong className="text-neutral-900">Insetos em geral</strong>{" "}
                      <span className="text-[10px] text-neutral-500">
                        (baratas, formigas, aranhas, cupins etc.)
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="mt-0.5 text-xs text-[#16a34a]">◆</span>
                    <div>
                      <strong className="text-neutral-900">Roedores</strong>{" "}
                      <span className="text-[10px] text-neutral-500">
                        (ratos e camundongos)
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="mt-0.5 text-xs text-[#16a34a]">◆</span>
                    <div>
                      <strong className="text-neutral-900">Mosquitos</strong>{" "}
                      <span className="text-[10px] text-neutral-500">
                        (dengue, zika, chikungunya)
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="mt-0.5 text-xs text-[#16a34a]">◆</span>
                    <div>
                      <strong className="text-neutral-900">Ácaros</strong>{" "}
                      <span className="text-[10px] text-neutral-500">
                        (alérgenos e poeira)
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="mt-0.5 text-xs text-[#16a34a]">◆</span>
                    <div>
                      <strong className="text-neutral-900">Cupins</strong>{" "}
                      <span className="text-[10px] text-neutral-500">
                        (madeira e estruturas)
                      </span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* 4. SERVIÇOS OFERECIDOS */}
            <div className="mt-6">
              <div className="flex items-center gap-2 text-xs font-black tracking-wider text-neutral-900 uppercase">
                <span className="text-sm text-[#16a34a]">●</span>
                <span>SERVIÇOS OFERECIDOS</span>
              </div>
              <p className="mt-1 text-[11.5px] leading-relaxed text-neutral-600">
                Dedetização, desratização, desinsetização, controle de pragas urbanas e sanitização de
                ambientes. Utilizamos técnicas modernas e produtos regularizados, seguindo as normas de
                segurança e meio ambiente.
              </p>
            </div>

            {/* 5. TABELA DE ITENS / PREÇOS */}
            <div className="mt-4 overflow-hidden rounded border border-neutral-300">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-[#4c5d54] text-[10.5px] font-black tracking-wider text-white uppercase">
                    <th className="w-12 px-3 py-2.5 text-center">ITEM</th>
                    <th className="px-4 py-2.5">DESCRIÇÃO DO SERVIÇO</th>
                    <th className="px-3 py-2.5">ÁREA ESTIMADA</th>
                    <th className="w-28 px-4 py-2.5 text-right">VALOR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  <tr className="bg-white">
                    <td className="px-3 py-3 text-center font-bold text-neutral-500">01</td>
                    <td className="px-4 py-3">
                      <div className="font-extrabold text-neutral-900 uppercase">
                        {doc.servico}
                      </div>
                      {doc.metodologia && (
                        <div className="mt-1 text-[11px] text-neutral-600">
                          <strong>Metodologia:</strong> {doc.metodologia}
                        </div>
                      )}
                      {doc.produtos && (
                        <div className="mt-0.5 text-[11px] text-neutral-600">
                          <strong>Produtos:</strong> {doc.produtos}
                        </div>
                      )}
                      {doc.cliente_endereco && (
                        <div className="mt-1 text-[10px] text-neutral-500 uppercase">
                          <strong>Local:</strong> {doc.cliente_endereco}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-[11px] font-semibold text-neutral-700">
                      {areaEstimada}
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-black text-neutral-900 whitespace-nowrap">
                      {brl(doc.valor)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-2 space-y-0.5 text-[9.5px] text-neutral-500">
              <p>* O valor final poderá ser ajustado conforme a metragem, o tipo de praga e a necessidade específica de cada ambiente.</p>
              <p>* Após a vistoria técnica, será emitido o orçamento definitivo.</p>
            </div>

            {/* 6. POR QUE ESCOLHER A GF? (5 Cards) */}
            <div className="mt-6">
              <div className="flex items-center gap-2 text-xs font-black tracking-wider text-neutral-900 uppercase">
                <span className="text-xs text-[#16a34a]">■</span>
                <span>POR QUE ESCOLHER A GF?</span>
              </div>

              <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {/* 1 */}
                <div className="flex flex-col items-center justify-center rounded border border-[#e2e8e5] bg-[#f4f7f5] p-2.5 text-center">
                  <div className="mb-1 text-[#16a34a]">
                    <Icon name="check" size={18} />
                  </div>
                  <span className="text-[10px] font-bold leading-tight text-neutral-800">
                    Equipe treinada e especializada
                  </span>
                </div>

                {/* 2 */}
                <div className="flex flex-col items-center justify-center rounded border border-[#e2e8e5] bg-[#f4f7f5] p-2.5 text-center">
                  <div className="mb-1 text-[#16a34a]">
                    <Icon name="shield" size={18} />
                  </div>
                  <span className="text-[10px] font-bold leading-tight text-neutral-800">
                    Produtos com registro na Anvisa
                  </span>
                </div>

                {/* 3 */}
                <div className="flex flex-col items-center justify-center rounded border border-[#e2e8e5] bg-[#f4f7f5] p-2.5 text-center">
                  <div className="mb-1 text-[#16a34a]">
                    <Icon name="leaf" size={18} />
                  </div>
                  <span className="text-[10px] font-bold leading-tight text-neutral-800">
                    Respeito ao meio ambiente
                  </span>
                </div>

                {/* 4 */}
                <div className="flex flex-col items-center justify-center rounded border border-[#e2e8e5] bg-[#f4f7f5] p-2.5 text-center">
                  <div className="mb-1 text-[#16a34a]">
                    <Icon name="clock" size={18} />
                  </div>
                  <span className="text-[10px] font-bold leading-tight text-neutral-800">
                    Atendimento rápido e personalizado
                  </span>
                </div>

                {/* 5 */}
                <div className="flex flex-col items-center justify-center rounded border border-[#e2e8e5] bg-[#f4f7f5] p-2.5 text-center">
                  <div className="mb-1 text-[#16a34a]">
                    <Icon name="star" size={18} />
                  </div>
                  <span className="text-[10px] font-bold leading-tight text-neutral-800">
                    Garantia de qualidade nos serviços
                  </span>
                </div>
              </div>
            </div>

            {/* 7. CONDIÇÕES COMERCIAIS */}
            <div className="mt-6">
              <div className="mb-2 text-xs font-black tracking-wider text-neutral-900 uppercase">
                CONDIÇÕES COMERCIAIS
              </div>

              <div className="rounded border border-[#e2e8e5] bg-[#f4f7f5] p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-center">
                  {/* Lado Esquerdo */}
                  <div className="space-y-1.5 text-xs md:col-span-7">
                    <div>
                      <strong className="text-neutral-900">Forma de pagamento:</strong>{" "}
                      <span className="font-semibold text-neutral-700">PIX, CRÉDITO OU DÉBITO</span>
                    </div>
                    <div>
                      <strong className="text-neutral-900">Prazo de execução:</strong>{" "}
                      <span className="font-semibold text-neutral-700">A combinar / Imediato</span>
                    </div>
                    {isOrc && doc.validade && (
                      <div>
                        <strong className="text-neutral-900">Validade da proposta:</strong>{" "}
                        <span className="font-semibold text-neutral-700">{dataBR(doc.validade)}</span>
                      </div>
                    )}
                    <div>
                      <strong className="text-neutral-900">Garantia:</strong>{" "}
                      <span className="font-semibold text-neutral-700">{garantiaTexto}</span>
                    </div>
                  </div>

                  {/* Lado Direito */}
                  <div className="border-t border-neutral-200 pt-3 text-xs md:col-span-5 md:border-t-0 md:border-l md:pl-5 md:pt-0">
                    <p className="text-[11px] leading-snug text-neutral-600">
                      Estamos à disposição para esclarecer qualquer dúvida e agendar uma vistoria técnica, sem compromisso.
                    </p>
                    <div className="mt-2 text-sm font-black text-[#16a34a]">
                      GF Dedetizações
                    </div>
                    <div className="text-[10px] text-neutral-500 italic">
                      Proteção para o seu espaço, sempre.
                    </div>
                    <div className="mt-1.5 text-[11px] font-bold text-neutral-800">
                      Central: {BRAND.telefone}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 8. ASSINATURAS (Com suporte a Assinatura da GF Dedetização e do Cliente) */}
            <div className="mt-8 grid grid-cols-2 gap-8 pt-4 text-center text-xs">
              {/* Coluna 1: GF Dedetização */}
              <div className="flex flex-col justify-end">
                {gfAssinatura?.imagem ? (
                  <div>
                    <img
                      src={gfAssinatura.imagem}
                      alt="Assinatura GF Dedetização"
                      className="mx-auto -mb-1 block max-h-14 max-w-[210px] object-contain"
                    />
                    <div className="border-t border-neutral-800 pt-1.5">
                      <strong className="text-neutral-900">{gfAssinatura.nome || BRAND.nome}</strong>
                      <div className="text-[10px] text-neutral-500">
                        GF Dedetização • Técnico Responsável
                        {gfAssinatura.em ? ` • ${gfAssinatura.em}` : ""}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="h-12" />
                    <div className="border-t border-neutral-800 pt-1.5">
                      <strong className="text-neutral-900">{BRAND.nome}</strong>
                      <div className="text-[11px] text-neutral-500">Técnico Responsável</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Coluna 2: Cliente / Responsável */}
              <div className="flex flex-col justify-end">
                {doc.assinatura_imagem ? (
                  <div>
                    <img
                      src={doc.assinatura_imagem}
                      alt={`Assinatura de ${doc.assinatura_nome || doc.cliente_nome}`}
                      className="mx-auto -mb-1 block max-h-14 max-w-[210px] object-contain"
                    />
                    <div className="border-t border-neutral-800 pt-1.5">
                      <strong className="text-neutral-900">{doc.assinatura_nome || doc.cliente_nome}</strong>
                      <div className="text-[10px] text-neutral-500">
                        Assinado digitalmente em {doc.assinatura_em}
                        {doc.assinatura_documento ? ` • Doc: ${doc.assinatura_documento}` : ""}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="h-12" />
                    <div className="border-t border-neutral-800 pt-1.5">
                      <strong className="text-neutral-900">{doc.cliente_nome}</strong>
                      <div className="text-[11px] text-neutral-500">Cliente / Responsável</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Ação rápida para o cliente assinar online quando acessar pelo link público */}
            {isPublic && !doc.assinatura_imagem && (
              <div className="no-print mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <AssinaturaModal
                  tipo={cfg.tipo}
                  docId={doc.id}
                  clienteNome={doc.cliente_nome}
                  isPublic={true}
                />
              </div>
            )}

            {/* 9. RODAPÉ INSTITUCIONAL */}
            <footer className="mt-6 border-t border-neutral-200 pt-3 text-center text-[10px] text-neutral-500">
              <div className="font-bold text-neutral-700">
                {BRAND.nome} • {BRAND.slogan}
              </div>
              <div>
                Contato / WhatsApp: <strong>{BRAND.telefone}</strong> • Instagram: <strong>@{BRAND.instagram}</strong>
              </div>
            </footer>
          </div>
        </article>
      </div>
    </div>
  );
}

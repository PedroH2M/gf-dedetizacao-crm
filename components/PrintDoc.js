import Link from "next/link";
import { notFound } from "next/navigation";
import Logo from "./Logo";
import PrintButton from "./PrintButton";
import Icon from "./Icon";
import { BRAND } from "@/lib/constants";
import { brl, dataBR, numero } from "@/lib/format";
import { getDoc } from "@/lib/queries";

/** Documento A4 limpo (fundo branco) para imprimir / salvar em PDF. */
export default async function PrintDoc({ cfg, id }) {
  const doc = getDoc(cfg.table, Number(id));
  if (!doc) notFound();
  const isOrc = cfg.tipo === "orcamento";

  const linhas = [
    ["Data", dataBR(doc.data)],
    ["Serviço", doc.servico],
    ["Produtos utilizados", doc.produtos],
    isOrc && ["Metodologia de tratamento", doc.metodologia],
    isOrc && ["Validade da proposta", dataBR(doc.validade)],
    ["Status", doc.status],
    ["Observações", doc.observacoes],
  ].filter((l) => l && l[1]);

  return (
    <div className="sheet">
      <div className="no-print sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-neutral-300 bg-white p-3">
        <Link href={`/${cfg.rota}/${doc.id}`} className="btn btn-sm" style={{ background: "#eee", color: "#111" }}>
          <Icon name="back" size={18} /> Voltar
        </Link>
        <PrintButton />
      </div>

      <article className="doc">
        <header className="doc-head">
          <Logo print size={46} />
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">{cfg.rotulo}</p>
            <p className="text-2xl font-black">Nº {numero(doc.id)}</p>
            <p className="text-sm text-neutral-600">{dataBR(doc.data)}</p>
          </div>
        </header>

        <h2>Cliente</h2>
        <table>
          <tbody>
            <tr><th>Nome</th><td>{doc.cliente_nome}</td></tr>
            {doc.cliente_telefone && <tr><th>Telefone</th><td>{doc.cliente_telefone}</td></tr>}
            {doc.cliente_email && <tr><th>E-mail</th><td>{doc.cliente_email}</td></tr>}
            {doc.cliente_endereco && <tr><th>Endereço</th><td>{doc.cliente_endereco}</td></tr>}
          </tbody>
        </table>

        <h2>{isOrc ? "Proposta" : "Serviço"}</h2>
        <table>
          <tbody>
            {linhas.map(([k, v]) => (
              <tr key={k}><th>{k}</th><td style={{ whiteSpace: "pre-wrap" }}>{v}</td></tr>
            ))}
            <tr><th>{isOrc ? "Valor da proposta" : "Valor total"}</th><td className="total">{brl(doc.valor)}</td></tr>
          </tbody>
        </table>

        <div className="doc-sign">
          <div className="doc-sign-col">
            <div style={{ minHeight: "50px" }} />
            <div className="doc-sign-line">
              <strong>{BRAND.nome}</strong>
              <div style={{ fontSize: "0.75rem", color: "#666" }}>Técnico Responsável</div>
            </div>
          </div>

          <div className="doc-sign-col">
            {doc.assinatura_imagem ? (
              <div>
                <img
                  src={doc.assinatura_imagem}
                  alt={`Assinatura de ${doc.assinatura_nome || doc.cliente_nome}`}
                  style={{
                    maxHeight: "54px",
                    maxWidth: "220px",
                    margin: "0 auto -4px auto",
                    display: "block",
                  }}
                />
                <div className="doc-sign-line">
                  <strong>{doc.assinatura_nome || doc.cliente_nome}</strong>
                  <div style={{ fontSize: "0.72rem", color: "#555", marginTop: "2px" }}>
                    Assinado digitalmente em {doc.assinatura_em}
                    {doc.assinatura_documento ? ` • Doc: ${doc.assinatura_documento}` : ""}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ minHeight: "50px" }} />
                <div className="doc-sign-line">
                  <strong>{doc.cliente_nome}</strong>
                  <div style={{ fontSize: "0.75rem", color: "#666" }}>Cliente / Responsável</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className="doc-foot">
          <strong>{BRAND.slogan}</strong>
          <br />
          {BRAND.slogan2}
          <br />
          Instagram: @{BRAND.instagram}
        </footer>
      </article>
    </div>
  );
}

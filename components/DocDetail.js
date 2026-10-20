import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "./Icon";
import DeleteButton from "./DeleteButton";
import AssinaturaModal from "./AssinaturaModal";
import EnvioBotoes from "./EnvioBotoes";
import { BADGE } from "@/lib/constants";
import { brl, dataBR, hojeISO, numero } from "@/lib/format";
import { mailtoUrl, resumoTexto, whatsappUrl } from "@/lib/share";
import { getDoc } from "@/lib/queries";
import { converterOrcamento, deleteDoc, setStatus } from "@/app/actions";

function Linha({ label, children }) {
  if (!children) return null;
  return (
    <div className="border-t border-line py-3 first:border-0 first:pt-0">
      <p className="label !mb-1">{label}</p>
      <p className="whitespace-pre-wrap break-words text-[1.02rem] leading-snug">{children}</p>
    </div>
  );
}

export default async function DocDetail({ cfg, id }) {
  const numId = Number(id);
  if (!Number.isFinite(numId) || numId <= 0) notFound();
  const doc = await getDoc(cfg.table, numId);
  if (!doc) notFound();

  const texto = resumoTexto(cfg.tipo, doc);
  const textoEmail = resumoTexto(cfg.tipo, doc, { negrito: false });
  const isOrc = cfg.tipo === "orcamento";
  const vencida = isOrc && doc.validade < hojeISO() && !["Aprovado", "Recusado"].includes(doc.status);

  return (
    <div className="fade-in space-y-4">
      <div className="flex items-center gap-3">
        <Link href={`/${cfg.rota}`} className="icon-btn" aria-label="Voltar"><Icon name="back" /></Link>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-muted">{cfg.rotulo}</p>
          <h1 className="text-2xl font-black tracking-tight">Nº {numero(doc.id)}</h1>
        </div>
        <span className={`badge ${BADGE[doc.status] || ""}`}>{doc.status}</span>
      </div>

      {/* Ações rápidas e envio automático */}
      <EnvioBotoes
        tipo={cfg.tipo}
        doc={doc}
        whatsappFallbackUrl={whatsappUrl(doc, texto)}
        emailFallbackUrl={mailtoUrl(cfg.tipo, doc, textoEmail)}
        printUrl={`/${cfg.rota}/${doc.id}/imprimir`}
      />
      {!doc.cliente_telefone && (
        <p className="text-xs text-muted">Cliente sem telefone cadastrado.</p>
      )}

      <section className="card">
        <div className="flex items-end justify-between gap-3 border-b border-line pb-3">
          <div className="min-w-0">
            <p className="label !mb-1">Cliente</p>
            <Link href={`/clientes/${doc.cliente_id}`} className="block truncate text-lg font-bold text-brand-green">
              {doc.cliente_nome}
            </Link>
          </div>
          <div className="text-right">
            <p className="label !mb-1">Valor</p>
            <p className="text-2xl font-black text-brand-green">{brl(doc.valor)}</p>
          </div>
        </div>
        <div className="pt-3">
          <Linha label="Data">{dataBR(doc.data)}</Linha>
          <Linha label="Serviço">{doc.servico}</Linha>
          <Linha label="Produtos">{doc.produtos}</Linha>
          {isOrc && <Linha label="Metodologia de tratamento">{doc.metodologia}</Linha>}
          {isOrc && (
            <Linha label="Validade">
              {dataBR(doc.validade)}
              {vencida ? " — vencida" : ""}
            </Linha>
          )}
          <Linha label="Observações">{doc.observacoes}</Linha>
        </div>
      </section>

      {/* Assinaturas Digitais (GF Dedetização e Cliente) */}
      <section className="space-y-3">
        <AssinaturaModal
          tipo={cfg.tipo}
          docId={doc.id}
          alvo="gf"
          assinaturaAtual={
            doc.assinatura_gf_imagem
              ? {
                  imagem: doc.assinatura_gf_imagem,
                  nome: doc.assinatura_gf_nome,
                  em: doc.assinatura_gf_em,
                }
              : null
          }
        />

        <AssinaturaModal
          tipo={cfg.tipo}
          docId={doc.id}
          alvo="cliente"
          clienteNome={doc.cliente_nome}
          assinaturaAtual={
            doc.assinatura_imagem
              ? {
                  imagem: doc.assinatura_imagem,
                  nome: doc.assinatura_nome,
                  documento: doc.assinatura_documento,
                  em: doc.assinatura_em,
                }
              : null
          }
        />
      </section>

      <section>
        <p className="section-title !mt-2">Alterar status</p>
        <div className="chips">
          {cfg.status.map((s) => (
            <form key={s} action={setStatus.bind(null, cfg.tipo, doc.id, s)}>
              <button type="submit" className={`chip ${s === doc.status ? "chip-active" : ""}`}>{s}</button>
            </form>
          ))}
        </div>
      </section>

      <div className="space-y-3 pt-2">
        {isOrc && doc.status !== "Recusado" && (
          <form action={converterOrcamento.bind(null, doc.id)}>
            <button type="submit" className="btn btn-ghost btn-block">
              <Icon name="repeat" size={20} /> Aprovar e gerar Ordem de Serviço
            </button>
          </form>
        )}
        <Link href={`/${cfg.rota}/${doc.id}/editar`} className="btn btn-ghost btn-block">
          <Icon name="edit" size={20} /> Editar
        </Link>
        <DeleteButton
          action={deleteDoc.bind(null, cfg.tipo, doc.id)}
          confirmText={`Excluir ${cfg.rotulo} nº ${numero(doc.id)}? Essa ação não pode ser desfeita.`}
        />
      </div>
    </div>
  );
}

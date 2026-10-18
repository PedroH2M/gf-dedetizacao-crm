import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "./Icon";
import DocForm from "./DocForm";
import { addDias, hojeISO, valorInput } from "@/lib/format";
import { getDoc, listClientesBasico } from "@/lib/queries";

/** Página de criação/edição de OS e Propostas. */
export default async function DocFormPage({ cfg, id, searchParams }) {
  const clientes = await listClientesBasico();
  let doc = null;
  if (id) {
    doc = await getDoc(cfg.table, Number(id));
    if (!doc) notFound();
    doc = { ...doc, valor: valorInput(doc.valor) };
  }

  const sp = (await searchParams) ?? {};
  const hoje = hojeISO();
  const defaults = {
    cliente_id: Number(sp.cliente) || "",
    data: hoje,
    validade: addDias(hoje, 15),
    status: cfg.statusPadrao,
  };
  const novoNome = cfg.tipo === "os" ? "Nova Ordem de Serviço" : "Nova Proposta";

  return (
    <div className="fade-in">
      <div className="mb-5 flex items-center gap-3">
        <Link href={doc ? `/${cfg.rota}/${doc.id}` : `/${cfg.rota}`} className="icon-btn" aria-label="Voltar">
          <Icon name="back" />
        </Link>
        <h1 className="text-2xl font-black tracking-tight">{doc ? `Editar ${cfg.curto}` : novoNome}</h1>
      </div>

      {clientes.length === 0 ? (
        <div className="card space-y-3 text-center">
          <p className="font-semibold">Cadastre um cliente antes de criar {cfg.tipo === "os" ? "uma OS" : "uma proposta"}.</p>
          <Link href="/clientes/novo" className="btn btn-primary btn-block">
            <Icon name="plus" size={20} /> Novo cliente
          </Link>
        </div>
      ) : (
        <DocForm cfg={cfg} clientes={clientes} doc={doc} defaults={defaults} />
      )}
    </div>
  );
}

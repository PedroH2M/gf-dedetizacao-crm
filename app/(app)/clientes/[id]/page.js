import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/Icon";
import DocCard from "@/components/DocCard";
import DeleteButton from "@/components/DeleteButton";
import { DOCS } from "@/lib/constants";
import { waNumber } from "@/lib/format";
import { getCliente, listDocsByCliente } from "@/lib/queries";
import { deleteCliente } from "@/app/actions";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const c = getCliente(Number(id));
  return { title: c?.nome ?? "Cliente" };
}

function Info({ label, children }) {
  if (!children) return null;
  return (
    <div className="border-t border-line py-3 first:border-0 first:pt-0">
      <p className="label !mb-1">{label}</p>
      <p className="whitespace-pre-wrap break-words leading-snug">{children}</p>
    </div>
  );
}

export default async function ClientePage({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const cliente = getCliente(Number(id));
  if (!cliente) notFound();

  const oss = listDocsByCliente(DOCS.os.table, cliente.id);
  const orcs = listDocsByCliente(DOCS.orcamento.table, cliente.id);
  const wa = waNumber(cliente.telefone);

  return (
    <div className="fade-in space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/clientes" className="icon-btn" aria-label="Voltar"><Icon name="back" /></Link>
        <h1 className="min-w-0 flex-1 truncate text-2xl font-black tracking-tight">{cliente.nome}</h1>
      </div>

      {sp?.erro === "vinculos" && (
        <p role="alert" className="alert alert-error">
          Este cliente possui OS ou propostas. Exclua-as primeiro para poder remover o cadastro.
        </p>
      )}

      <div className="grid grid-cols-3 gap-2.5">
        <a href={`tel:+${wa}`} className="btn btn-ghost !flex-col !gap-1.5 !px-2 !py-3 !text-sm">
          <Icon name="phone" size={24} /> Ligar
        </a>
        <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
          className="btn btn-primary !flex-col !gap-1.5 !px-2 !py-3 !text-sm">
          <Icon name="whatsapp" size={24} /> WhatsApp
        </a>
        {cliente.email ? (
          <a href={`mailto:${cliente.email}`} className="btn btn-ghost !flex-col !gap-1.5 !px-2 !py-3 !text-sm">
            <Icon name="mail" size={24} /> E-mail
          </a>
        ) : (
          <Link href={`/clientes/${cliente.id}/editar`} className="btn btn-ghost !flex-col !gap-1.5 !px-2 !py-3 !text-sm">
            <Icon name="edit" size={24} /> Editar
          </Link>
        )}
      </div>

      <section className="card">
        <Info label="Telefone / WhatsApp">{cliente.telefone}</Info>
        <Info label="E-mail">{cliente.email}</Info>
        <Info label="Endereço">{cliente.endereco}</Info>
        <Info label="Anotações">{cliente.anotacoes}</Info>
        {cliente.endereco && (
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cliente.endereco)}`}
            target="_blank" rel="noopener noreferrer"
            className="btn btn-outline btn-sm btn-block mt-3">
            <Icon name="pin" size={18} /> Abrir no mapa
          </a>
        )}
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Link href={`/os/nova?cliente=${cliente.id}`} className="btn btn-primary btn-sm">
          <Icon name="plus" size={18} /> Nova OS
        </Link>
        <Link href={`/orcamentos/novo?cliente=${cliente.id}`} className="btn btn-outline btn-sm">
          <Icon name="plus" size={18} /> Proposta
        </Link>
      </div>

      <h2 className="section-title">Ordens de serviço ({oss.length})</h2>
      {oss.length ? (
        <div className="space-y-3">{oss.map((d) => <DocCard key={d.id} cfg={DOCS.os} d={d} />)}</div>
      ) : (
        <p className="card text-center text-sm text-muted">Nenhuma OS para este cliente.</p>
      )}

      <h2 className="section-title">Propostas ({orcs.length})</h2>
      {orcs.length ? (
        <div className="space-y-3">{orcs.map((d) => <DocCard key={d.id} cfg={DOCS.orcamento} d={d} />)}</div>
      ) : (
        <p className="card text-center text-sm text-muted">Nenhuma proposta para este cliente.</p>
      )}

      <div className="space-y-3 pt-4">
        <Link href={`/clientes/${cliente.id}/editar`} className="btn btn-ghost btn-block">
          <Icon name="edit" size={20} /> Editar cadastro
        </Link>
        <DeleteButton
          action={deleteCliente.bind(null, cliente.id)}
          confirmText={`Excluir o cliente ${cliente.nome}? Essa ação não pode ser desfeita.`}
          label="Excluir cliente"
        />
      </div>
    </div>
  );
}

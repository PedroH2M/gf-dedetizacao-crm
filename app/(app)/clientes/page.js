import Link from "next/link";
import Icon from "@/components/Icon";
import { listClientes } from "@/lib/queries";
import { waNumber } from "@/lib/format";

export const metadata = { title: "Clientes" };
const PASSO = 30;

export default async function ClientesPage({ searchParams }) {
  const sp = await searchParams;
  const q = String(sp?.q ?? "").trim().slice(0, 80);
  const limite = Math.min(Math.max(Number(sp?.n) || PASSO, PASSO), 300);
  const rows = listClientes(q, limite + 1);
  const temMais = rows.length > limite;
  const clientes = rows.slice(0, limite);

  return (
    <>
      <h1 className="mb-4 text-2xl font-black tracking-tight">Clientes</h1>

      <form action="/clientes" role="search" className="relative mb-4">
        <Icon name="search" size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input name="q" type="search" defaultValue={q} className="input" style={{ paddingLeft: "2.8rem" }}
          placeholder="Buscar por nome, telefone ou e-mail" enterKeyHint="search" autoComplete="off" />
      </form>

      {clientes.length === 0 ? (
        <div className="card py-10 text-center text-muted">
          <p className="font-semibold">{q ? "Nenhum cliente encontrado." : "Nenhum cliente cadastrado ainda."}</p>
          <p className="mt-1 text-sm">Toque em “Novo” para cadastrar.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {clientes.map((c) => (
            <li key={c.id} className="card fade-in !p-0 overflow-hidden">
              <Link href={`/clientes/${c.id}`} className="flex items-center gap-3 p-4 active:bg-surface-2">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface-2 font-black text-brand-green">
                  {c.nome.trim().charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{c.nome}</span>
                  <span className="block truncate text-sm text-muted">{c.telefone}</span>
                </span>
                <Icon name="chevron" className="text-muted" />
              </Link>
              <div className="grid grid-cols-2 border-t border-line text-sm font-bold">
                <a href={`tel:+${waNumber(c.telefone)}`} className="flex min-h-12 items-center justify-center gap-2 border-r border-line active:bg-surface-2">
                  <Icon name="phone" size={18} /> Ligar
                </a>
                <a href={`https://wa.me/${waNumber(c.telefone)}`} target="_blank" rel="noopener noreferrer"
                  className="flex min-h-12 items-center justify-center gap-2 text-brand-green active:bg-surface-2">
                  <Icon name="whatsapp" size={18} /> WhatsApp
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}

      {temMais && (
        <Link href={`/clientes?${new URLSearchParams({ ...(q && { q }), n: String(limite + PASSO) })}`}
          className="btn btn-ghost btn-block mt-4">Carregar mais</Link>
      )}

      <Link id="fab-novo" href="/clientes/novo" className="fab"><Icon name="plus" size={22} /> Novo</Link>
    </>
  );
}

import Link from "next/link";
import Icon from "./Icon";
import DocCard from "./DocCard";
import { listDocs } from "@/lib/queries";

const PASSO = 30;

/** Lista com busca, filtro por status e "carregar mais" (somente links, sem JS). */
export default async function DocList({ cfg, searchParams }) {
  const sp = await searchParams;
  const q = String(sp?.q ?? "").trim().slice(0, 80);
  const status = cfg.status.includes(sp?.status) ? sp.status : "";
  const limite = Math.min(Math.max(Number(sp?.n) || PASSO, PASSO), 300);

  const docs = await listDocs(cfg.table, { q, status, limit: limite + 1 });
  const temMais = docs.length > limite;
  const visiveis = docs.slice(0, limite);

  const href = (extra) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (extra.status ?? status) p.set("status", extra.status ?? status);
    if (extra.n) p.set("n", extra.n);
    const s = p.toString();
    return `/${cfg.rota}${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <h1 className="mb-4 text-2xl font-black tracking-tight">{cfg.titulo}</h1>

      <form action={`/${cfg.rota}`} role="search" className="relative mb-3">
        {status && <input type="hidden" name="status" value={status} />}
        <Icon name="search" size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input name="q" type="search" defaultValue={q} className="input" style={{ paddingLeft: "2.8rem" }}
          placeholder="Buscar por cliente ou serviço" enterKeyHint="search" autoComplete="off" />
      </form>

      <div className="chips mb-4" role="group" aria-label="Filtrar por status">
        <Link href={href({ status: "" })} className={`chip ${!status ? "chip-active" : ""}`}>Todas</Link>
        {cfg.status.map((s) => (
          <Link key={s} href={href({ status: s })} className={`chip ${status === s ? "chip-active" : ""}`}>{s}</Link>
        ))}
      </div>

      {visiveis.length === 0 ? (
        <div className="card py-10 text-center text-muted">
          <p className="font-semibold">Nenhum registro encontrado.</p>
          <p className="mt-1 text-sm">Toque em “Novo” para criar.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visiveis.map((d) => <DocCard key={d.id} cfg={cfg} d={d} />)}
        </div>
      )}

      {temMais && (
        <Link href={href({ n: limite + PASSO })} className="btn btn-ghost btn-block mt-4">Carregar mais</Link>
      )}

      <Link id="fab-novo" href={`/${cfg.rota}/${cfg.tipo === "os" ? "nova" : "novo"}`} className="fab">
        <Icon name="plus" size={22} /> Novo
      </Link>
    </>
  );
}

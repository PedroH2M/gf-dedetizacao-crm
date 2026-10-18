import Link from "next/link";
import Icon from "@/components/Icon";
import DocCard from "@/components/DocCard";
import { BRAND, DOCS } from "@/lib/constants";
import { brl } from "@/lib/format";
import { getStats, orcamentosAbertos, proximosServicos } from "@/lib/queries";

export const metadata = { title: "Início" };

export default function Dashboard() {
  const s = getStats();
  const proximos = proximosServicos(4);
  const orcs = orcamentosAbertos(3);

  return (
    <div className="fade-in">
      <section className="hero">
        <h1 className="hero-title">
          O fim das pragas.
          <br />A sua <span className="glow-text">paz.</span>
        </h1>
        <p className="mt-3 max-w-sm text-[.95rem] leading-relaxed text-neutral-300">{BRAND.slogan2}</p>
        <a
          href={BRAND.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-black/40 px-4 text-sm font-bold"
        >
          <Icon name="instagram" size={18} className="text-brand-green" /> @{BRAND.instagram}
        </a>
      </section>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Link href="/clientes/novo" className="tile"><Icon name="users" size={26} />Novo cliente</Link>
        <Link href="/os/nova" className="tile"><Icon name="clipboard" size={26} />Nova OS</Link>
        <Link href="/orcamentos/novo" className="tile"><Icon name="file" size={26} />Nova proposta</Link>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Link href="/clientes" className="card stat"><b>{s.clientes}</b><span>Clientes</span></Link>
        <Link href="/os?status=Agendada" className="card stat"><b>{s.osAbertas}</b><span>OS em aberto</span></Link>
        <Link href="/orcamentos?status=Pendente" className="card stat"><b>{s.orcPendentes}</b><span>Propostas pendentes</span></Link>
        <div className="card stat"><b className="text-brand-green">{brl(s.faturamentoMes)}</b><span>Faturado no mês</span></div>
      </div>

      <h2 className="section-title">Próximos serviços</h2>
      {proximos.length ? (
        <div className="space-y-3">{proximos.map((d) => <DocCard key={d.id} cfg={DOCS.os} d={d} />)}</div>
      ) : (
        <p className="card text-center text-sm text-muted">Nenhum serviço agendado.</p>
      )}

      {orcs.length > 0 && (
        <>
          <h2 className="section-title">Propostas aguardando resposta</h2>
          <div className="space-y-3">{orcs.map((d) => <DocCard key={d.id} cfg={DOCS.orcamento} d={d} />)}</div>
        </>
      )}
    </div>
  );
}

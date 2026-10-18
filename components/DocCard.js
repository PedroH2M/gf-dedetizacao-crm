import Link from "next/link";
import { BADGE } from "@/lib/constants";
import { brl, dataBR, numero } from "@/lib/format";

export default function DocCard({ cfg, d }) {
  return (
    <Link href={`/${cfg.rota}/${d.id}`} className="card fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-muted">
            {cfg.curto} #{numero(d.id)} · {dataBR(d.data)}
          </p>
          <p className="mt-0.5 truncate text-base font-bold">{d.cliente_nome}</p>
          <p className="truncate text-sm text-muted">{d.servico}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <p className="font-black text-brand-green">{brl(d.valor)}</p>
          <span className={`badge ${BADGE[d.status] || ""}`}>{d.status}</span>
        </div>
      </div>
    </Link>
  );
}

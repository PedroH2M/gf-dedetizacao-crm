"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveOS, saveOrcamento } from "@/app/actions";
import { SERVICOS } from "@/lib/constants";

/** Formulário compartilhado de Ordem de Serviço e Proposta Comercial. */
export default function DocForm({ cfg, clientes, doc, defaults }) {
  const isOrc = cfg.tipo === "orcamento";
  const [state, action, pending] = useActionState(isOrc ? saveOrcamento : saveOS, null);
  const v = (k) => state?.values?.[k] ?? doc?.[k] ?? defaults?.[k] ?? "";
  const voltar = doc ? `/${cfg.rota}/${doc.id}` : `/${cfg.rota}`;

  return (
    <form action={action} className="space-y-4">
      {doc && <input type="hidden" name="id" value={doc.id} />}
      {state?.error && <p role="alert" className="alert alert-error">{state.error}</p>}

      <div>
        <label htmlFor="cliente_id" className="label">Cliente *</label>
        <select id="cliente_id" name="cliente_id" className="input" required defaultValue={v("cliente_id")}>
          <option value="" disabled>Selecione o cliente...</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="data" className="label">Data *</label>
          <input id="data" name="data" type="date" className="input" required defaultValue={v("data")} />
        </div>
        <div>
          <label htmlFor="status" className="label">Status *</label>
          <select id="status" name="status" className="input" defaultValue={v("status") || cfg.statusPadrao}>
            {cfg.status.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="servico" className="label">Serviço *</label>
        <input id="servico" name="servico" className="input" required maxLength={200} list="servicos"
          autoComplete="off" enterKeyHint="next" placeholder="Ex.: Dedetização geral" defaultValue={v("servico")} />
        <datalist id="servicos">
          {SERVICOS.map((s) => <option key={s} value={s} />)}
        </datalist>
      </div>

      <div>
        <label htmlFor="produtos" className="label">Produtos utilizados</label>
        <textarea id="produtos" name="produtos" className="input" rows={3} maxLength={1000}
          placeholder="Ex.: Cipermetrina 20%, gel para baratas, isca raticida" defaultValue={v("produtos")} />
      </div>

      <div>
        <label htmlFor="valor" className="label">Valor (R$) *</label>
        <input id="valor" name="valor" className="input" required inputMode="decimal" autoComplete="off"
          enterKeyHint="next" placeholder="0,00" defaultValue={v("valor")} />
      </div>

      {isOrc && (
        <>
          <div>
            <label htmlFor="metodologia" className="label">Metodologia de tratamento</label>
            <textarea id="metodologia" name="metodologia" className="input" rows={4} maxLength={2000}
              placeholder="Descreva como o tratamento será executado: pulverização, gel, nebulização, barreira química..."
              defaultValue={v("metodologia")} />
          </div>
          <div>
            <label htmlFor="validade" className="label">Validade da proposta *</label>
            <input id="validade" name="validade" type="date" className="input" required defaultValue={v("validade")} />
          </div>
        </>
      )}

      <div>
        <label htmlFor="observacoes" className="label">Observações</label>
        <textarea id="observacoes" name="observacoes" className="input" rows={2} maxLength={2000}
          placeholder="Garantia, condições de pagamento, recomendações..." defaultValue={v("observacoes")} />
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <Link href={voltar} className="btn btn-ghost">Cancelar</Link>
        <button id="btn-salvar-doc" type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}

"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveOS, saveOrcamento } from "@/app/actions";
import { SERVICOS, resolverFlagsServico } from "@/lib/constants";

/** Formulário compartilhado de Ordem de Serviço e Proposta Comercial. */
export default function DocForm({ cfg, clientes, doc, defaults }) {
  const isOrc = cfg.tipo === "orcamento";
  const [state, action, pending] = useActionState(isOrc ? saveOrcamento : saveOS, null);
  const v = (k) => state?.values?.[k] ?? doc?.[k] ?? defaults?.[k] ?? "";
  const voltar = doc ? `/${cfg.rota}/${doc.id}` : `/${cfg.rota}`;

  const flagsIniciais = doc
    ? resolverFlagsServico(doc)
    : { dedetizacao: false, caixaDagua: false };

  const [flagDedet, setFlagDedet] = useState(() =>
    state?.values ? Boolean(state.values.flag_dedetizacao) : flagsIniciais.dedetizacao,
  );
  const [flagCaixa, setFlagCaixa] = useState(() =>
    state?.values ? Boolean(state.values.flag_caixa_dagua) : flagsIniciais.caixaDagua,
  );

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
        <span className="label">Tipo de serviço (modelo do documento) *</span>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-neutral-800 hover:bg-neutral-50">
            <span>Dedetização</span>
            <span className="relative inline-flex items-center">
              <input
                type="checkbox"
                name="flag_dedetizacao"
                value="1"
                checked={flagDedet}
                onChange={(e) => setFlagDedet(e.target.checked)}
                className="peer sr-only"
              />
              <span className="h-6 w-11 rounded-full bg-neutral-300 transition-colors peer-checked:bg-[#16a34a] peer-focus-visible:ring-2 peer-focus-visible:ring-[#16a34a]/40 after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5" />
            </span>
          </label>
          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-neutral-800 hover:bg-neutral-50">
            <span>Limpeza de caixa d&apos;água</span>
            <span className="relative inline-flex items-center">
              <input
                type="checkbox"
                name="flag_caixa_dagua"
                value="1"
                checked={flagCaixa}
                onChange={(e) => setFlagCaixa(e.target.checked)}
                className="peer sr-only"
              />
              <span className="h-6 w-11 rounded-full bg-neutral-300 transition-colors peer-checked:bg-[#16a34a] peer-focus-visible:ring-2 peer-focus-visible:ring-[#16a34a]/40 after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5" />
            </span>
          </label>
        </div>
        <p className="mt-1 text-xs text-neutral-500">
          Marque uma opção ou ambas para gerar o modelo individual ou unificado na impressão.
        </p>
      </div>

      <div>
        <label htmlFor="servico" className="label">Descrição do serviço *</label>
        <input id="servico" name="servico" className="input" required maxLength={200} list="servicos"
          autoComplete="off" enterKeyHint="next" placeholder="Ex.: Dedetização geral"
          defaultValue={v("servico")} />
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

      {!isOrc && (
        <div>
          <label htmlFor="nao_conformidades" className="label">Não conformidades</label>
          <textarea id="nao_conformidades" name="nao_conformidades" className="input" rows={3} maxLength={2000}
            placeholder="Frestas em portas/ralos, acúmulo de resíduos, infiltrações, pontos de acesso de pragas..."
            defaultValue={v("nao_conformidades")} />
        </div>
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

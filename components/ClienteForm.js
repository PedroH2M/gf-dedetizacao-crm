"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveCliente } from "@/app/actions";

export default function ClienteForm({ cliente }) {
  const [state, action, pending] = useActionState(saveCliente, null);
  const v = (k) => state?.values?.[k] ?? cliente?.[k] ?? "";

  return (
    <form action={action} className="space-y-4">
      {cliente && <input type="hidden" name="id" value={cliente.id} />}
      {state?.error && (
        <p role="alert" className="alert alert-error">{state.error}</p>
      )}

      <div>
        <label htmlFor="nome" className="label">Nome *</label>
        <input id="nome" name="nome" className="input" required maxLength={120}
          autoComplete="name" autoCapitalize="words" enterKeyHint="next"
          placeholder="Nome do cliente" defaultValue={v("nome")} />
      </div>
      <div>
        <label htmlFor="telefone" className="label">Telefone (WhatsApp) *</label>
        <input id="telefone" name="telefone" type="tel" className="input" required maxLength={30}
          inputMode="tel" autoComplete="tel" enterKeyHint="next"
          placeholder="(11) 91234-5678" defaultValue={v("telefone")} />
      </div>
      <div>
        <label htmlFor="email" className="label">E-mail</label>
        <input id="email" name="email" type="email" className="input" maxLength={120}
          inputMode="email" autoComplete="email" autoCapitalize="none" autoCorrect="off"
          enterKeyHint="next" placeholder="cliente@email.com" defaultValue={v("email")} />
      </div>
      <div>
        <label htmlFor="endereco" className="label">Endereço</label>
        <textarea id="endereco" name="endereco" className="input" rows={2} maxLength={300}
          autoComplete="street-address" placeholder="Rua, número, bairro, cidade"
          defaultValue={v("endereco")} />
      </div>
      <div>
        <label htmlFor="anotacoes" className="label">Anotações</label>
        <textarea id="anotacoes" name="anotacoes" className="input" rows={3} maxLength={2000}
          placeholder="Pragas relatadas, acesso ao local, preferências..." defaultValue={v("anotacoes")} />
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <Link href={cliente ? `/clientes/${cliente.id}` : "/clientes"} className="btn btn-ghost">Cancelar</Link>
        <button id="btn-salvar-cliente" type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}

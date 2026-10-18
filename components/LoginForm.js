"use client";

import { useActionState } from "react";
import { login } from "@/app/actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="space-y-4" noValidate>
      {state?.error && (
        <p role="alert" className="alert alert-error">
          {state.error}
        </p>
      )}
      <div>
        <label htmlFor="email" className="label">E-mail</label>
        <input
          id="email" name="email" type="email" className="input" required
          inputMode="email" autoComplete="username" autoCapitalize="none" autoCorrect="off"
          enterKeyHint="next" placeholder="seu@email.com"
          defaultValue={state?.values?.email ?? ""}
        />
      </div>
      <div>
        <label htmlFor="senha" className="label">Senha</label>
        <input
          id="senha" name="senha" type="password" className="input" required
          autoComplete="current-password" enterKeyHint="go" placeholder="••••••••"
        />
      </div>
      <button id="btn-entrar" type="submit" className="btn btn-primary btn-block" disabled={pending}>
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}

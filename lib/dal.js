import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, verifyToken } from "./session";

/** Sessão atual (ou null). Memoizada por requisição. */
export const getSession = cache(async () => {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  return verifyToken(token);
});

/** Exige sessão válida; caso contrário redireciona para /login. */
export async function requireSession() {
  const s = await getSession();
  if (!s) redirect("/login");
  return s;
}

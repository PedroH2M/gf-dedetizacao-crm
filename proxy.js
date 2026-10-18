import { NextResponse } from "next/server";
import { COOKIE_NAME, verifyToken } from "@/lib/session";

// Bloqueia rotas restritas até a autenticação correta, permitindo rotas públicas (documentos p/ clientes e login).
export function proxy(request) {
  const { pathname } = request.nextUrl;
  const logado = !!verifyToken(request.cookies.get(COOKIE_NAME)?.value);

  if (
    pathname === "/login" ||
    pathname.startsWith("/documento/") ||
    pathname.startsWith("/proposta/") ||
    pathname.startsWith("/api/public/")
  ) {
    if (pathname === "/login" && logado) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!logado) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|logo.png|icon.svg|manifest.webmanifest|robots.txt).*)"],
};

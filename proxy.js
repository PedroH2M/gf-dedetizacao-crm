import { NextResponse } from "next/server";
import { COOKIE_NAME, verifyToken } from "@/lib/session";

// Bloqueia todo o sistema até a autenticação correta.
export function proxy(request) {
  const { pathname } = request.nextUrl;
  const logado = !!verifyToken(request.cookies.get(COOKIE_NAME)?.value);

  if (pathname === "/login") {
    return logado ? NextResponse.redirect(new URL("/", request.url)) : NextResponse.next();
  }
  if (!logado) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|icon.svg|manifest.webmanifest|robots.txt).*)"],
};

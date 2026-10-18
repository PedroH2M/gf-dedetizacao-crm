"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";

const ITEMS = [
  { href: "/", label: "Início", icon: "home" },
  { href: "/clientes", label: "Clientes", icon: "users" },
  { href: "/os", label: "OS", icon: "clipboard" },
  { href: "/orcamentos", label: "Propostas", icon: "file" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const ativo = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  return (
    <nav className="bottomnav" aria-label="Navegação principal">
      {ITEMS.map((i) => (
        <Link key={i.href} href={i.href} aria-current={ativo(i.href) ? "page" : undefined}>
          <Icon name={i.icon} size={24} />
          {i.label}
        </Link>
      ))}
    </nav>
  );
}

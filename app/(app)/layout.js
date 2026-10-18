import Link from "next/link";
import Logo from "@/components/Logo";
import Icon from "@/components/Icon";
import BottomNav from "@/components/BottomNav";
import { requireSession } from "@/lib/dal";
import { logout } from "@/app/actions";

export default async function AppLayout({ children }) {
  await requireSession();
  return (
    <>
      <header className="topbar">
        <Link href="/" aria-label="Início">
          <Logo size={34} />
        </Link>
        <form action={logout}>
          <button id="btn-sair" type="submit" className="icon-btn" aria-label="Sair">
            <Icon name="logout" size={20} />
          </button>
        </form>
      </header>
      <main className="page">{children}</main>
      <BottomNav />
    </>
  );
}

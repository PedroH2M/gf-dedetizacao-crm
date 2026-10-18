import Logo from "@/components/Logo";
import LoginForm from "@/components/LoginForm";
import Icon from "@/components/Icon";
import { BRAND } from "@/lib/constants";

export const metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <main
      className="relative flex min-h-dvh flex-col justify-center overflow-hidden px-5 py-10"
      style={{
        background:
          "radial-gradient(90% 55% at 50% 0%, rgba(57,255,20,.20), transparent 70%), #121212",
      }}
    >
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo size={96} showText={false} />
          <h1 className="mt-5 text-[1.85rem] font-black leading-tight tracking-tight">
            O fim das pragas.
            <br />
            A sua <span className="glow-text">paz.</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">{BRAND.slogan2}</p>
        </div>

        <div className="card space-y-1 !p-5">
          <p className="mb-3 text-sm font-bold text-muted">Acesso restrito • Administrador</p>
          <LoginForm />
        </div>

        <a
          href={BRAND.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 flex items-center justify-center gap-2 text-sm font-semibold text-muted"
        >
          <Icon name="instagram" size={18} /> @{BRAND.instagram}
        </a>
      </div>
    </main>
  );
}

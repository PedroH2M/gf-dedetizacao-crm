import Link from "next/link";

export const metadata = { title: "Página não encontrada" };

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="text-6xl font-black text-brand-green">404</p>
        <h1 className="mt-2 text-xl font-bold">Página não encontrada</h1>
        <Link href="/" className="btn btn-primary mt-6">Voltar ao início</Link>
      </div>
    </main>
  );
}

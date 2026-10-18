import Link from "next/link";
import Icon from "@/components/Icon";
import ClienteForm from "@/components/ClienteForm";

export const metadata = { title: "Novo cliente" };

export default function NovoClientePage() {
  return (
    <div className="fade-in">
      <div className="mb-5 flex items-center gap-3">
        <Link href="/clientes" className="icon-btn" aria-label="Voltar"><Icon name="back" /></Link>
        <h1 className="text-2xl font-black tracking-tight">Novo cliente</h1>
      </div>
      <ClienteForm />
    </div>
  );
}

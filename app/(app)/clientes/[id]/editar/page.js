import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/Icon";
import ClienteForm from "@/components/ClienteForm";
import { getCliente } from "@/lib/queries";

export const metadata = { title: "Editar cliente" };

export default async function EditarClientePage({ params }) {
  const { id } = await params;
  const cliente = getCliente(Number(id));
  if (!cliente) notFound();
  return (
    <div className="fade-in">
      <div className="mb-5 flex items-center gap-3">
        <Link href={`/clientes/${cliente.id}`} className="icon-btn" aria-label="Voltar"><Icon name="back" /></Link>
        <h1 className="text-2xl font-black tracking-tight">Editar cliente</h1>
      </div>
      <ClienteForm cliente={cliente} />
    </div>
  );
}

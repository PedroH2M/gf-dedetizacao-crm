import { notFound } from "next/navigation";
import PrintDoc from "@/components/PrintDoc";
import { DOCS } from "@/lib/constants";
import { getDoc } from "@/lib/queries";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId) || numId <= 0) return { title: "Proposta não encontrada" };
  const doc = await getDoc(DOCS.orcamento.table, numId);
  if (!doc) return { title: "Proposta não encontrada" };
  return {
    title: `Proposta Comercial Nº ${String(doc.id).padStart(4, "0")} • GF Dedetização`,
    description: `Proposta comercial da GF Dedetização para ${doc.cliente_nome}.`,
  };
}

export default async function PropostaPublicaPage({ params }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId) || numId <= 0) notFound();
  return <PrintDoc cfg={DOCS.orcamento} id={numId} isPublic={true} />;
}

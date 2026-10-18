import { notFound } from "next/navigation";
import PrintDoc from "@/components/PrintDoc";
import { DOCS } from "@/lib/constants";
import { getDoc } from "@/lib/queries";

export async function generateMetadata({ params }) {
  const { tipo, id } = await params;
  const cfg = DOCS[tipo];
  if (!cfg) return { title: "Documento não encontrado" };
  const numId = Number(id);
  if (!Number.isFinite(numId) || numId <= 0) return { title: "Documento não encontrado" };
  const doc = await getDoc(cfg.table, numId);
  if (!doc) return { title: "Documento não encontrado" };
  return {
    title: `${cfg.rotulo} Nº ${String(doc.id).padStart(4, "0")} • GF Dedetização`,
    description: `Documento oficial da GF Dedetização para ${doc.cliente_nome}.`,
  };
}

export default async function DocumentoPublicoPage({ params }) {
  const { tipo, id } = await params;
  const cfg = DOCS[tipo];
  if (!cfg) notFound();
  const numId = Number(id);
  if (!Number.isFinite(numId) || numId <= 0) notFound();
  return <PrintDoc cfg={cfg} id={numId} isPublic={true} />;
}

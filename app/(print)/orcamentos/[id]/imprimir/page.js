import PrintDoc from "@/components/PrintDoc";
import { DOCS } from "@/lib/constants";

export const metadata = { title: "Imprimir proposta" };

export default async function Page({ params }) {
  const { id } = await params;
  return <PrintDoc cfg={DOCS.orcamento} id={id} />;
}

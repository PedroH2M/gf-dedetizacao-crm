import DocDetail from "@/components/DocDetail";
import { DOCS } from "@/lib/constants";

export const metadata = { title: "Proposta Comercial" };

export default async function Page({ params }) {
  const { id } = await params;
  return <DocDetail cfg={DOCS.orcamento} id={id} />;
}

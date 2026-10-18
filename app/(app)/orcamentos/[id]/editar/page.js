import DocFormPage from "@/components/DocFormPage";
import { DOCS } from "@/lib/constants";

export const metadata = { title: "Editar proposta" };

export default async function Page({ params, searchParams }) {
  const { id } = await params;
  return <DocFormPage cfg={DOCS.orcamento} id={id} searchParams={searchParams} />;
}

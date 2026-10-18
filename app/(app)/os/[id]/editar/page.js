import DocFormPage from "@/components/DocFormPage";
import { DOCS } from "@/lib/constants";

export const metadata = { title: "Editar OS" };

export default async function Page({ params, searchParams }) {
  const { id } = await params;
  return <DocFormPage cfg={DOCS.os} id={id} searchParams={searchParams} />;
}

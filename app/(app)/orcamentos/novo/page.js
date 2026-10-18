import DocFormPage from "@/components/DocFormPage";
import { DOCS } from "@/lib/constants";

export const metadata = { title: "Nova proposta" };

export default function Page({ searchParams }) {
  return <DocFormPage cfg={DOCS.orcamento} searchParams={searchParams} />;
}

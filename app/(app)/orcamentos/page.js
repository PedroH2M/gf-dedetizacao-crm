import DocList from "@/components/DocList";
import { DOCS } from "@/lib/constants";

export const metadata = { title: "Propostas" };

export default function Page({ searchParams }) {
  return <DocList cfg={DOCS.orcamento} searchParams={searchParams} />;
}

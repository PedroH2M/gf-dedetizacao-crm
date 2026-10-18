import DocList from "@/components/DocList";
import { DOCS } from "@/lib/constants";

export const metadata = { title: "Ordens de Serviço" };

export default function Page({ searchParams }) {
  return <DocList cfg={DOCS.os} searchParams={searchParams} />;
}

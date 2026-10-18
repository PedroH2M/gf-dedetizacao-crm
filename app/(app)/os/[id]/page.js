import DocDetail from "@/components/DocDetail";
import { DOCS } from "@/lib/constants";

export const metadata = { title: "Ordem de Serviço" };

export default async function Page({ params }) {
  const { id } = await params;
  return <DocDetail cfg={DOCS.os} id={id} />;
}

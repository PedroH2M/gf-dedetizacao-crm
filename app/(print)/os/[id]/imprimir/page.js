import PrintDoc from "@/components/PrintDoc";
import { DOCS } from "@/lib/constants";

export const metadata = { title: "Imprimir OS" };

export default async function Page({ params }) {
  const { id } = await params;
  return <PrintDoc cfg={DOCS.os} id={id} />;
}

import DocFormPage from "@/components/DocFormPage";
import { DOCS } from "@/lib/constants";

export const metadata = { title: "Nova OS" };

export default function Page({ searchParams }) {
  return <DocFormPage cfg={DOCS.os} searchParams={searchParams} />;
}

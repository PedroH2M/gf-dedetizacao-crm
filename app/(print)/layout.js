import { requireSession } from "@/lib/dal";

export default async function PrintLayout({ children }) {
  await requireSession();
  return children;
}

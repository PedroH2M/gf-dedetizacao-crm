const brlFmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const brl = (n) => brlFmt.format(Number(n) || 0);

export const numero = (id) => String(id).padStart(4, "0");

/** 'YYYY-MM-DD' -> 'DD/MM/YYYY' (sem Date, evita problemas de fuso). */
export function dataBR(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso || "";
  return iso.split("-").reverse().join("/");
}

/** Hoje (America/Sao_Paulo) como 'YYYY-MM-DD'. */
export function hojeISO() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
}

export function addDias(iso, dias) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

export function isISODate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s || "")) return false;
  const d = new Date(`${s}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

/** Aceita "1.234,56", "150,5", "150.50", "150". Retorna número ou null. */
export function parseValor(input) {
  let s = String(input ?? "").replace(/[^\d.,-]/g, "");
  if (!s) return 0;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  else if (!/^-?\d+(\.\d{1,2})?$/.test(s)) s = s.replace(/\./g, "");
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
}

/** Número -> texto para campo de edição ("1234,50"). */
export const valorInput = (n) => (n || n === 0 ? Number(n).toFixed(2).replace(".", ",") : "");

export const digits = (s) => String(s ?? "").replace(/\D/g, "");

/** Número para wa.me (assume Brasil quando não houver DDI). */
export function waNumber(tel) {
  const d = digits(tel);
  if (d.length < 10) return "";
  return d.length <= 11 ? `55${d}` : d;
}

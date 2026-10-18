import crypto from "node:crypto";

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

/** Comparação em tempo constante. */
export function verifyPassword(password, stored) {
  const [scheme, salt, hash] = String(stored).split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const given = crypto.scryptSync(password, salt, expected.length);
  return crypto.timingSafeEqual(given, expected);
}

// Hash fictício para igualar o tempo de resposta quando o e-mail não existe.
export const DUMMY_HASH = hashPassword("dummy-password-for-timing");

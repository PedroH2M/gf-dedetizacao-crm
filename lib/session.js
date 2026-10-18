import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export const COOKIE_NAME = "gf_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

let secretCache;

/** Segredo de assinatura: env SESSION_SECRET ou arquivo gerado em data/.session-secret */
function getSecret() {
  if (secretCache) return secretCache;
  if (process.env.SESSION_SECRET) return (secretCache = process.env.SESSION_SECRET);

  const dir = path.join(process.cwd(), "data");
  const file = path.join(dir, ".session-secret");
  fs.mkdirSync(dir, { recursive: true });
  try {
    fs.writeFileSync(file, crypto.randomBytes(48).toString("hex"), { flag: "wx", mode: 0o600 });
  } catch (e) {
    if (e.code !== "EEXIST") throw e;
  }
  return (secretCache = fs.readFileSync(file, "utf8").trim());
}

const b64 = (buf) => Buffer.from(buf).toString("base64url");
const hmac = (data) => crypto.createHmac("sha256", getSecret()).update(data).digest();

export function createToken(uid) {
  const payload = b64(JSON.stringify({ uid, exp: Date.now() + SESSION_MAX_AGE * 1000 }));
  return `${payload}.${b64(hmac(payload))}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== "string") return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = hmac(payload);
  let given;
  try {
    given = Buffer.from(sig, "base64url");
  } catch {
    return null;
  }
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data.exp || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

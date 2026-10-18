import { createClient } from "@libsql/client";
import fs from "node:fs";
import path from "node:path";
import { hashPassword } from "./password.js";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS usuarios (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  email      TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  criado_em  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS clientes (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  nome      TEXT NOT NULL,
  telefone  TEXT NOT NULL,
  email     TEXT,
  endereco  TEXT,
  anotacoes TEXT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome COLLATE NOCASE);

CREATE TABLE IF NOT EXISTS ordens_servico (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id  INTEGER NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  data        TEXT NOT NULL,
  servico     TEXT NOT NULL,
  produtos    TEXT,
  valor       REAL NOT NULL DEFAULT 0,
  status      TEXT NOT NULL DEFAULT 'Agendada',
  observacoes TEXT,
  assinatura_imagem    TEXT,
  assinatura_nome      TEXT,
  assinatura_documento TEXT,
  assinatura_em        TEXT,
  criado_em   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_os_cliente ON ordens_servico(cliente_id);
CREATE INDEX IF NOT EXISTS idx_os_status_data ON ordens_servico(status, data);

CREATE TABLE IF NOT EXISTS orcamentos (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id  INTEGER NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  data        TEXT NOT NULL,
  servico     TEXT NOT NULL,
  produtos    TEXT,
  valor       REAL NOT NULL DEFAULT 0,
  metodologia TEXT,
  validade    TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'Pendente',
  observacoes TEXT,
  criado_em   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_orc_cliente ON orcamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_orc_status_data ON orcamentos(status, data);
`;

export function getClient() {
  if (!globalThis.__gfDbClient) {
    const tursoUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
    const tursoAuth = process.env.TURSO_AUTH_TOKEN;

    if (tursoUrl) {
      globalThis.__gfDbClient = createClient({
        url: tursoUrl,
        authToken: tursoAuth,
      });
    } else {
      const file = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "gf.db");
      fs.mkdirSync(path.dirname(file), { recursive: true });
      globalThis.__gfDbClient = createClient({
        url: `file:${file.replace(/\\/g, "/")}`,
      });
    }
  }
  return globalThis.__gfDbClient;
}

export const getDb = getClient;

let initPromise = null;

export async function ensureDb() {
  if (!initPromise) {
    initPromise = (async () => {
      const client = getClient();
      await client.executeMultiple(SCHEMA);

      // Migrações graduais para colunas de assinatura
      try {
        const colRes = await client.execute("PRAGMA table_info(ordens_servico)");
        const colunasOS = colRes.rows.map((c) => c.name);
        if (!colunasOS.includes("assinatura_imagem")) {
          await client.execute("ALTER TABLE ordens_servico ADD COLUMN assinatura_imagem TEXT;");
        }
        if (!colunasOS.includes("assinatura_nome")) {
          await client.execute("ALTER TABLE ordens_servico ADD COLUMN assinatura_nome TEXT;");
        }
        if (!colunasOS.includes("assinatura_documento")) {
          await client.execute("ALTER TABLE ordens_servico ADD COLUMN assinatura_documento TEXT;");
        }
        if (!colunasOS.includes("assinatura_em")) {
          await client.execute("ALTER TABLE ordens_servico ADD COLUMN assinatura_em TEXT;");
        }
      } catch (err) {
        // Ignora erro em pragmas específicos se não suportados
      }

      // Administrador padrão
      const email = (process.env.ADMIN_EMAIL || "gilvandro3008@gmail.com").trim().toLowerCase();
      const exists = await client.execute({
        sql: "SELECT id FROM usuarios WHERE email = ?",
        args: [email],
      });
      if (exists.rows.length === 0) {
        const senha = process.env.ADMIN_PASSWORD || "clara3008";
        await client.execute({
          sql: "INSERT INTO usuarios (email, senha_hash) VALUES (?, ?)",
          args: [email, hashPassword(senha)],
        });
      }
    })();
  }
  return initPromise;
}

/** Retorna linhas como objetos simples. */
export async function all(sql, ...params) {
  await ensureDb();
  const res = await getClient().execute({ sql, args: params });
  return res.rows.map((r) => ({ ...r }));
}

export async function one(sql, ...params) {
  await ensureDb();
  const res = await getClient().execute({ sql, args: params });
  return res.rows[0] ? { ...res.rows[0] } : null;
}

export async function run(sql, ...params) {
  await ensureDb();
  const res = await getClient().execute({ sql, args: params });
  return {
    changes: Number(res.rowsAffected),
    id: Number(res.lastInsertRowid),
  };
}

import { DatabaseSync } from "node:sqlite";
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

function init() {
  const file = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "gf.db");
  fs.mkdirSync(path.dirname(file), { recursive: true });

  const db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA synchronous = NORMAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec("PRAGMA busy_timeout = 5000;");
  db.exec(SCHEMA);

  // Migrações graduais para bancos já existentes
  const colunasOS = db.prepare("PRAGMA table_info(ordens_servico)").all().map((c) => c.name);
  if (!colunasOS.includes("assinatura_imagem")) {
    db.exec("ALTER TABLE ordens_servico ADD COLUMN assinatura_imagem TEXT;");
  }
  if (!colunasOS.includes("assinatura_nome")) {
    db.exec("ALTER TABLE ordens_servico ADD COLUMN assinatura_nome TEXT;");
  }
  if (!colunasOS.includes("assinatura_documento")) {
    db.exec("ALTER TABLE ordens_servico ADD COLUMN assinatura_documento TEXT;");
  }
  if (!colunasOS.includes("assinatura_em")) {
    db.exec("ALTER TABLE ordens_servico ADD COLUMN assinatura_em TEXT;");
  }

  // Administrador padrão (troque via ADMIN_EMAIL / ADMIN_PASSWORD no .env.local)
  const email = (process.env.ADMIN_EMAIL || "gilvandro3008@gmail.com").trim().toLowerCase();
  const exists = db.prepare("SELECT id FROM usuarios WHERE email = ?").get(email);
  if (!exists) {
    const senha = process.env.ADMIN_PASSWORD || "clara3008";
    db.prepare("INSERT INTO usuarios (email, senha_hash) VALUES (?, ?)").run(email, hashPassword(senha));
  }
  return db;
}

/** Conexão singleton (sobrevive ao HMR do modo dev). Inicialização preguiçosa. */
export function getDb() {
  return (globalThis.__gfDb ??= init());
}

const plain = (row) => (row ? { ...row } : null);

/** Retorna linhas como objetos simples (necessário para passar a Client Components). */
export function all(sql, ...params) {
  return getDb().prepare(sql).all(...params).map(plain);
}
export function one(sql, ...params) {
  return plain(getDb().prepare(sql).get(...params));
}
export function run(sql, ...params) {
  const r = getDb().prepare(sql).run(...params);
  return { changes: Number(r.changes), id: Number(r.lastInsertRowid) };
}

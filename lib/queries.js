import { all, one, run } from "./db.js";
import { DOCS_BY_TABLE } from "./constants.js";
import { hojeISO } from "./format.js";

const like = (q) => `%${q}%`;

// ---------- Clientes ----------
export function listClientes(q = "", limit = 30) {
  return all(
    `SELECT c.*,
            (SELECT COUNT(*) FROM ordens_servico o WHERE o.cliente_id = c.id) AS total_os
       FROM clientes c
      WHERE (? = '' OR c.nome LIKE ? OR c.telefone LIKE ? OR c.email LIKE ?)
      ORDER BY c.nome COLLATE NOCASE
      LIMIT ?`,
    q, like(q), like(q), like(q), limit,
  );
}

export const listClientesBasico = () =>
  all("SELECT id, nome FROM clientes ORDER BY nome COLLATE NOCASE");

export const getCliente = (id) => one("SELECT * FROM clientes WHERE id = ?", id);

export function saveClienteDb({ id, nome, telefone, email, endereco, anotacoes }) {
  if (id) {
    run(
      "UPDATE clientes SET nome=?, telefone=?, email=?, endereco=?, anotacoes=? WHERE id=?",
      nome, telefone, email, endereco, anotacoes, id,
    );
    return id;
  }
  return run(
    "INSERT INTO clientes (nome, telefone, email, endereco, anotacoes) VALUES (?,?,?,?,?)",
    nome, telefone, email, endereco, anotacoes,
  ).id;
}

export function countVinculos(clienteId) {
  const a = one("SELECT COUNT(*) n FROM ordens_servico WHERE cliente_id = ?", clienteId).n;
  const b = one("SELECT COUNT(*) n FROM orcamentos WHERE cliente_id = ?", clienteId).n;
  return a + b;
}

export const deleteClienteDb = (id) => run("DELETE FROM clientes WHERE id = ?", id);

// ---------- OS / Orçamentos (tabela validada por whitelist) ----------
function tabela(table) {
  if (!DOCS_BY_TABLE[table]) throw new Error("Tabela inválida");
  return table;
}

export function listDocs(table, { q = "", status = "", limit = 30 } = {}) {
  return all(
    `SELECT d.*, c.nome AS cliente_nome
       FROM ${tabela(table)} d JOIN clientes c ON c.id = d.cliente_id
      WHERE (? = '' OR c.nome LIKE ? OR d.servico LIKE ?)
        AND (? = '' OR d.status = ?)
      ORDER BY d.data DESC, d.id DESC
      LIMIT ?`,
    q, like(q), like(q), status, status, limit,
  );
}

export function listDocsByCliente(table, clienteId) {
  return all(
    `SELECT d.*, c.nome AS cliente_nome
       FROM ${tabela(table)} d JOIN clientes c ON c.id = d.cliente_id
      WHERE d.cliente_id = ? ORDER BY d.data DESC, d.id DESC`,
    clienteId,
  );
}

export function getDoc(table, id) {
  return one(
    `SELECT d.*, c.nome AS cliente_nome, c.telefone AS cliente_telefone,
            c.email AS cliente_email, c.endereco AS cliente_endereco
       FROM ${tabela(table)} d JOIN clientes c ON c.id = d.cliente_id
      WHERE d.id = ?`,
    id,
  );
}

export function saveDocDb(table, d) {
  tabela(table);
  if (table === "ordens_servico") {
    if (d.id) {
      run(
        `UPDATE ordens_servico SET cliente_id=?, data=?, servico=?, produtos=?, valor=?, status=?, observacoes=? WHERE id=?`,
        d.cliente_id, d.data, d.servico, d.produtos, d.valor, d.status, d.observacoes, d.id,
      );
      return d.id;
    }
    return run(
      `INSERT INTO ordens_servico (cliente_id, data, servico, produtos, valor, status, observacoes) VALUES (?,?,?,?,?,?,?)`,
      d.cliente_id, d.data, d.servico, d.produtos, d.valor, d.status, d.observacoes,
    ).id;
  }
  if (d.id) {
    run(
      `UPDATE orcamentos SET cliente_id=?, data=?, servico=?, produtos=?, valor=?, metodologia=?, validade=?, status=?, observacoes=? WHERE id=?`,
      d.cliente_id, d.data, d.servico, d.produtos, d.valor, d.metodologia, d.validade, d.status, d.observacoes, d.id,
    );
    return d.id;
  }
  return run(
    `INSERT INTO orcamentos (cliente_id, data, servico, produtos, valor, metodologia, validade, status, observacoes) VALUES (?,?,?,?,?,?,?,?,?)`,
    d.cliente_id, d.data, d.servico, d.produtos, d.valor, d.metodologia, d.validade, d.status, d.observacoes,
  ).id;
}

export const setStatusDb = (table, id, status) =>
  run(`UPDATE ${tabela(table)} SET status = ? WHERE id = ?`, status, id);

export const deleteDocDb = (table, id) => run(`DELETE FROM ${tabela(table)} WHERE id = ?`, id);

// ---------- Painel ----------
export function getStats() {
  const mes = hojeISO().slice(0, 7);
  return {
    clientes: one("SELECT COUNT(*) n FROM clientes").n,
    osAbertas: one("SELECT COUNT(*) n FROM ordens_servico WHERE status IN ('Agendada','Em andamento')").n,
    orcPendentes: one("SELECT COUNT(*) n FROM orcamentos WHERE status IN ('Pendente','Enviado')").n,
    faturamentoMes: one(
      "SELECT COALESCE(SUM(valor),0) v FROM ordens_servico WHERE status = 'Concluída' AND substr(data,1,7) = ?",
      mes,
    ).v,
  };
}

export const proximosServicos = (limit = 4) =>
  all(
    `SELECT d.*, c.nome AS cliente_nome
       FROM ordens_servico d JOIN clientes c ON c.id = d.cliente_id
      WHERE d.status IN ('Agendada','Em andamento')
      ORDER BY d.data ASC, d.id ASC LIMIT ?`,
    limit,
  );

export const orcamentosAbertos = (limit = 3) =>
  all(
    `SELECT d.*, c.nome AS cliente_nome
       FROM orcamentos d JOIN clientes c ON c.id = d.cliente_id
      WHERE d.status IN ('Pendente','Enviado')
      ORDER BY d.data DESC, d.id DESC LIMIT ?`,
    limit,
  );

// ---------- Assinatura Digital de Ordem de Serviço ----------
export function saveAssinaturaOSDb(osId, { imagem, nome, documento, em }) {
  return run(
    `UPDATE ordens_servico 
        SET assinatura_imagem = ?, 
            assinatura_nome = ?, 
            assinatura_documento = ?, 
            assinatura_em = ? 
      WHERE id = ?`,
    imagem,
    nome,
    documento || null,
    em,
    osId,
  );
}

export function removerAssinaturaOSDb(osId) {
  return run(
    `UPDATE ordens_servico 
        SET assinatura_imagem = NULL, 
            assinatura_nome = NULL, 
            assinatura_documento = NULL, 
            assinatura_em = NULL 
      WHERE id = ?`,
    osId,
  );
}


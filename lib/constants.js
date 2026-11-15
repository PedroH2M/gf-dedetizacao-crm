export const BRAND = {
  nome: "GF Dedetização",
  telefone: "(83) 98806-9060",
  telefoneRaw: "83988069060",
  whatsappUrl: "https://wa.me/5583988069060",
  instagram: "gfdedetiza",
  instagramUrl: "https://instagram.com/gfdedetiza",
  slogan: "O fim das pragas. A sua paz.",
  slogan2: "Proteção completa, saúde e o fim das pragas no seu ambiente.",
  logoUrl: "/logo.png",
};

export const STATUS_OS = ["Agendada", "Em andamento", "Concluída", "Cancelada"];
export const STATUS_ORC = ["Pendente", "Enviado", "Aprovado", "Recusado"];

export const BADGE = {
  Agendada: "badge-warn",
  "Em andamento": "badge-info",
  Concluída: "badge-green",
  Cancelada: "badge-danger",
  Pendente: "badge-warn",
  Enviado: "badge-info",
  Aprovado: "badge-green",
  Recusado: "badge-danger",
};

export const SERVICOS = [
  "Dedetização geral",
  "Desratização",
  "Descupinização",
  "Controle de baratas",
  "Controle de formigas",
  "Controle de escorpiões",
  "Controle de pulgas e carrapatos",
  "Controle de mosquitos (dengue)",
  "Limpeza de caixa d'água",
  "Sanitização de ambientes",
];

/** Configuração compartilhada entre Ordens de Serviço e Orçamentos. */
export const DOCS = {
  os: {
    tipo: "os",
    table: "ordens_servico",
    rota: "os",
    titulo: "Ordens de Serviço",
    rotulo: "Ordem de Serviço",
    curto: "OS",
    artigo: "a",
    status: STATUS_OS,
    statusPadrao: "Agendada",
  },
  orcamento: {
    tipo: "orcamento",
    table: "orcamentos",
    rota: "orcamentos",
    titulo: "Propostas",
    rotulo: "Proposta Comercial",
    curto: "Orç.",
    artigo: "a",
    status: STATUS_ORC,
    statusPadrao: "Pendente",
  },
};

export const DOCS_BY_TABLE = {
  ordens_servico: DOCS.os,
  orcamentos: DOCS.orcamento,
};

/** Resolve as flags de tipo de serviço, com fallback para registros legados. */
export function resolverFlagsServico(doc) {
  const temFlags = Boolean(doc?.flag_dedetizacao) || Boolean(doc?.flag_caixa_dagua);
  if (temFlags) {
    return {
      dedetizacao: Boolean(doc.flag_dedetizacao),
      caixaDagua: Boolean(doc.flag_caixa_dagua),
    };
  }
  const s = doc?.servico || "";
  const isCaixa = /caixa\s*d['’`]?[aá]gua/i.test(s);
  const isDedet =
    /dedetiza|desratiza|desinsetiza|descupiniza|praga|barata|formiga|escorpi|mosquito|pulga|sanitiza/i.test(
      s,
    );
  if (isCaixa && isDedet) return { dedetizacao: true, caixaDagua: true };
  if (isCaixa) return { dedetizacao: false, caixaDagua: true };
  return { dedetizacao: true, caixaDagua: false };
}

export function rotuloFlagsServico({ dedetizacao, caixaDagua }) {
  if (dedetizacao && caixaDagua) return "Dedetização e Limpeza de caixa d'água";
  if (caixaDagua) return "Limpeza de caixa d'água";
  return "Dedetização";
}

export const BRAND = {
  nome: "GF Dedetização",
  instagram: "gfdedetiza",
  instagramUrl: "https://instagram.com/gfdedetiza",
  slogan: "O fim das pragas. A sua paz.",
  slogan2: "Proteção completa, saúde e o fim das pragas no seu ambiente.",
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

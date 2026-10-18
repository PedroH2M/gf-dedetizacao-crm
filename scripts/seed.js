import { getDb, run } from "../lib/db.js";
import { hojeISO, addDias } from "../lib/format.js";

const db = getDb();
const hoje = hojeISO();

console.log("Iniciando inserção de dados de demonstração...");

// Limpar tabelas existentes mantendo o usuário
run("DELETE FROM orcamentos");
run("DELETE FROM ordens_servico");
run("DELETE FROM clientes");

const clientes = [
  {
    nome: "Restaurante Sabor & Arte",
    telefone: "(11) 98765-4321",
    email: "contato@saborearte.com.br",
    endereco: "Av. Paulista, 1200 - Bela Vista, São Paulo - SP",
    anotacoes: "Comércio de alimentação. Atendimento sempre às segundas-feiras após o fechamento (depois das 22h). Exige laudo técnico para vigilância sanitária."
  },
  {
    nome: "Condomínio Residencial Flores",
    telefone: "(11) 99123-4567",
    email: "sindico@condominioflores.com.br",
    endereco: "Rua das Camélias, 450 - Moema, São Paulo - SP",
    anotacoes: "Condomínio com 3 torres e 84 apartamentos. Foco nas áreas comuns, subsolos, bueiros e lixeiras."
  },
  {
    nome: "Camila Guimarães Santos",
    telefone: "(11) 97654-3210",
    email: "camila.guimaraes@gmail.com",
    endereco: "Rua Oscar Freire, 820, Apto 52 - Jardins, São Paulo - SP",
    anotacoes: "Possui 2 gatos de estimação. Necessário orientar sobre tempo de afastamento de 4 a 6 horas após a aplicação."
  },
  {
    nome: "Padaria & Confeitaria Pão D'Ouro",
    telefone: "(11) 98111-2233",
    email: "gerencia@paodouro.com.br",
    endereco: "Rua Domingos de Morais, 1500 - Vila Mariana, São Paulo - SP",
    anotacoes: "Problemas recorrentes de baratas pequenas (germânicas) na área do forno e estoques de farinha."
  },
  {
    nome: "Galpão Logístico TransBrasil",
    telefone: "(11) 99888-7766",
    email: "operacoes@transbrasil.log.br",
    endereco: "Rodovia Anhanguera, km 18 - Perus, São Paulo - SP",
    anotacoes: "Área de 4.500m². Instalação de porta-iscas de segurança para roedores em todo o perímetro."
  }
];

const clientesIds = [];
for (const c of clientes) {
  const res = run(
    "INSERT INTO clientes (nome, telefone, email, endereco, anotacoes) VALUES (?, ?, ?, ?, ?)",
    c.nome, c.telefone, c.email, c.endereco, c.anotacoes
  );
  clientesIds.push(res.id);
}
console.log(`✓ ${clientesIds.length} clientes criados.`);

// Ordens de Serviço
const osData = [
  {
    cliente_id: clientesIds[0],
    data: hoje,
    servico: "Controle Integrado de Baratas e Sanitização",
    produtos: "Gel Fipronil 0,05%, Deltametrina 2,5% CE, Quaternário de Amônio 5ª Geração",
    valor: 580.00,
    status: "Em andamento",
    observacoes: "Aplicação de gel em frestas e motores de geladeiras. Pulverização líquida nos ralos e caixas de gordura. Emissão de certificado de 6 meses."
  },
  {
    cliente_id: clientesIds[1],
    data: addDias(hoje, 1),
    servico: "Dedetização Geral e Desratização em Condomínio",
    produtos: "Cipermetrina 250 EC, Isca Raticida Bloco Parafinado (Brodifacoum)",
    valor: 1850.00,
    status: "Agendada",
    observacoes: "Pulverização em todas as lixeiras, garagens e bueiros. Reposição e mapeamento de 16 porta-iscas no perímetro."
  },
  {
    cliente_id: clientesIds[2],
    data: addDias(hoje, -5),
    servico: "Descupinização de Móveis e Rodapés",
    produtos: "Termitrip Pó Químico, Fipronil Líquido específico para cupim de madeira seca",
    valor: 920.00,
    status: "Concluída",
    observacoes: "Injeção e micropulverização nos armários do quarto do casal e closet. Garantia de 1 ano com retorno sem custo se necessário."
  },
  {
    cliente_id: clientesIds[3],
    data: addDias(hoje, 2),
    servico: "Dedetização de Baratas e Formigas",
    produtos: "Gel Formicida Hidrametilnona, Gel Baraticida Imidacloprido",
    valor: 450.00,
    status: "Agendada",
    observacoes: "Aplicação seletiva sem cheiro para não contaminar alimentos ou interromper a produção."
  }
];

for (const o of osData) {
  run(
    "INSERT INTO ordens_servico (cliente_id, data, servico, produtos, valor, status, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?)",
    o.cliente_id, o.data, o.servico, o.produtos, o.valor, o.status, o.observacoes
  );
}
console.log(`✓ ${osData.length} Ordens de Serviço criadas.`);

// Orçamentos / Propostas Comerciais
const orcamentos = [
  {
    cliente_id: clientesIds[4],
    data: hoje,
    servico: "Controle Perimetral de Roedores e Pragas Rasteiras",
    produtos: "Blocos extrusados parafinados resistentes à umidade, formulação micronizada piretroide",
    valor: 3400.00,
    metodologia: "Mapeamento em planta baixa de 32 pontos de controle crítico. Instalação de túneis de iscagem lacrados e fixados ao solo. Vistorias quinzenais com registro em planilha de monitoramento de consumo.",
    validade: addDias(hoje, 15),
    status: "Pendente",
    observacoes: "Proposta para contrato semestral com 12 visitas preventivas inclusas. Faturamento em até 28 dias após a emissão da NF."
  },
  {
    cliente_id: clientesIds[1],
    data: addDias(hoje, -2),
    servico: "Limpeza e Desinfecção de Caixas d'Água (30.000L)",
    produtos: "Hipoclorito de Sódio a 2,5% e neutralizadores biológicos",
    valor: 2200.00,
    metodologia: "Esgotamento programado, raspagem mecânica das paredes internas com cerdas macias, desinfecção por aspersão e teste microbiológico de potabilidade pós-serviço.",
    validade: addDias(hoje, 10),
    status: "Enviado",
    observacoes: "Aguardando aprovação na reunião de condomínio marcada para a próxima quinta-feira."
  },
  {
    cliente_id: clientesIds[2],
    data: addDias(hoje, -10),
    servico: "Descupinização de Piso Maciço",
    produtos: "Barreira química com Fipronil oleoso",
    valor: 1100.00,
    metodologia: "Furação estratégica com broca de 2mm nas juntas das réguas do piso e injeção sob pressão.",
    validade: addDias(hoje, -1),
    status: "Aprovado",
    observacoes: "Cliente aceitou a proposta. Já foi convertida na Ordem de Serviço concluída recentemente."
  }
];

for (const p of orcamentos) {
  run(
    "INSERT INTO orcamentos (cliente_id, data, servico, produtos, valor, metodologia, validade, status, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    p.cliente_id, p.data, p.servico, p.produtos, p.valor, p.metodologia, p.validade, p.status, p.observacoes
  );
}
console.log(`✓ ${orcamentos.length} Propostas Comerciais criadas.`);
console.log("Banco de dados populado com sucesso para testes!");

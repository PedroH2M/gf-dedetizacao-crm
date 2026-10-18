# GF Dedetização • CRM

> **O fim das pragas. A sua paz.** — Contato: **(83) 98806-9060** • @gfdedetiza

CRM mobile-first completo (Next.js 16 + Tailwind v4 + Turso/libSQL/SQLite) desenvolvido sob medida para a **GF Dedetização**, com gestão de clientes, Ordens de Serviço (com assinatura digital na tela), Propostas Comerciais, envio automático via WhatsApp & E-mail e impressão/PDF com o logotipo oficial.

---

## 🚀 Como Rodar Localmente

Requer Node 20+. O sistema roda tanto com SQLite local (arquivo `data/gf.db`) quanto com Turso na nuvem.

```bash
npm install
npm run seed      # (Opcional) Popula clientes e OS de teste
npm run build
npm start         # Inicia em http://localhost:3000
# Para desenvolvimento: npm run dev
```

- **Login inicial:** `gilvandro3008@gmail.com` / `clara3008` (configurável via variáveis de ambiente).
- **Acesso pelo celular na rede local:** Abra `http://IP-DO-SEU-PC:3000` no navegador do celular.

---

## 🌐 Deploy 100% Gratuito (Vercel + Turso)

Para colocar o sistema no ar na internet com domínio HTTPS e banco de dados permanente sem gastar **absolutamente nada**:

### Passo 1: Criar o Banco Gratuito no Turso
1. Acesse [turso.tech](https://turso.tech) e crie uma conta gratuita com seu GitHub (plano Free oferece 9 bilhões de leituras/mês e 500 bancos).
2. No painel do Turso, clique em **Create Database** (ex: `gf-crm`).
3. Copie a **Database URL** (começa com `libsql://...`) e gere um **Auth Token**.

### Passo 2: Publicar na Vercel
1. Acesse [vercel.com](https://vercel.com) e conecte sua conta do GitHub.
2. Clique em **Add New...** → **Project** e selecione o repositório `gf-dedetizacao-crm`.
3. Na seção **Environment Variables**, adicione as seguintes variáveis:
   - `TURSO_DATABASE_URL`: a URL copiada do Turso (`libsql://...`)
   - `TURSO_AUTH_TOKEN`: o token gerado no Turso
   - `ADMIN_EMAIL`: `gilvandro3008@gmail.com` (ou seu e-mail preferido)
   - `ADMIN_PASSWORD`: `clara3008` (ou a senha forte que desejar)
   - `COOKIE_SECURE`: `true`
   - `SESSION_SECRET`: uma frase aleatória longa (ex: `gf_dedetizacao_segredo_super_seguro_2026`)
4. Clique em **Deploy**.

Em menos de 1 minuto, seu CRM estará no ar com link seguro (ex: `https://gf-dedetizacao-crm.vercel.app`) pronto para usar no celular e computador!

---

## 📱 Funcionalidades Principais

- **Logotipo Oficial e Identidade Visual:** Logomarca oficial da GF Dedetização no tema Dark `#121212` com acento neon `#39ff14`, presente em todo o sistema e nas vias impressas/PDF.
- **Assinatura Digital de OS:** Cliente assina diretamente na tela do celular com o dedo; a assinatura com data/hora e documento é salva e impressa na OS e no laudo PDF.
- **Envio Automático via WhatsApp (Sem abrir o app):** Integração com Gateway REST (Evolution API / Z-API) que envia a mensagem, o logotipo e o link do laudo/proposta em PDF direto para o WhatsApp do cliente sem intervenção manual.
- **Disparo de E-mail No-Reply Automático:** Envio automático via Resend com modelo HTML profissional, logotipo incorporado e botão para o cliente acessar e baixar a proposta em PDF.
- **Link Público de Proposta:** Rota segura (`/documento/orcamento/[id]` ou `/proposta/[id]`) para o cliente visualizar e imprimir sua proposta comercial mesmo sem ter login no CRM.
- **Central de Atendimento:** Número oficial **(83) 98806-9060** em todos os cabeçalhos, rodapés e laudos gerados.

---

## ⚙️ Variáveis de Ambiente para Envios Automáticos (Opcional)

Para habilitar os disparos automáticos em segundo plano:

```env
# WhatsApp Gateway (Evolution API, Z-API ou compatível)
WHATSAPP_API_URL=https://sua-api-whatsapp.com
WHATSAPP_API_KEY=seu-token-da-instancia
WHATSAPP_INSTANCE=gfdedetizacao

# E-mail No-Reply (Resend.com - 3.000 e-mails grátis/mês)
RESEND_API_KEY=re_123456...
EMAIL_FROM="GF Dedetização <onboarding@resend.dev>"
```
*Caso não configure essas chaves, o sistema continuará oferecendo o envio com 1 clique via WhatsApp Web (`wa.me`) e cliente padrão de e-mail como alternativa.*

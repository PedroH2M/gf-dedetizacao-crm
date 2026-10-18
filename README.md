# GF Dedetização • CRM

> **O fim das pragas. A sua paz.** — @gfdedetiza

CRM mobile-first completo (Next.js 16 + Tailwind v4 + Turso/libSQL/SQLite) desenvolvido sob medida para a **GF Dedetização**, com gestão de clientes, Ordens de Serviço (com assinatura digital na tela), Propostas Comerciais, integração com WhatsApp e impressão/PDF.

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

- **Mobile-First & PWA:** Interface desenhada no tema Dark `#121212` com acento neon verde `#39ff14`, áreas de toque amplas (≥ 44px) e navegação inferior ágil.
- **Assinatura Digital de OS:** Cliente assina diretamente na tela do celular com o dedo; a assinatura com data/hora e documento é salva e impressa na OS e no laudo PDF.
- **WhatsApp Direto:** Envio de resumo formal com link direto para o cliente com um clique (`wa.me`).
- **Conversão Automática:** Transforma qualquer proposta comercial aprovada em Ordem de Serviço com um toque.
- **Impressão A4 & PDF:** Folha limpa em fundo branco formatada para exportação em PDF e arquivamento físico/digital.

---

## 🔒 Segurança

- Senha criptografada com algoritmo moderno `scrypt`.
- Sessão em cookie `HttpOnly` assinado via HMAC-SHA256 (7 dias de validade).
- Proteção contra força bruta (máximo de 5 tentativas a cada 15 min por IP/e-mail).
- Consultas SQL 100% parametrizadas contra injeção de código.

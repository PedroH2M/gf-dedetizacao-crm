# GF Dedetização • CRM

> **O fim das pragas. A sua paz.** — @gfdedetiza

CRM mobile-first (Next.js 16 + Tailwind v4 + SQLite) para clientes, Ordens de Serviço e Propostas Comerciais.

## Rodar

Requer Node 22.13+ (usa o SQLite nativo `node:sqlite`, sem módulos para compilar).

```bash
npm install
npm run build
npm start          # http://localhost:3000
# desenvolvimento: npm run dev
```

Login inicial: `gilvandro3008@gmail.com` / `clara3008` (troque via `.env.local`, veja `.env.example`).
Para acessar do celular na mesma rede: `http://IP-DO-PC:3000`.

## Estrutura

| Caminho | O que é |
| --- | --- |
| `proxy.js` | Bloqueia tudo sem sessão válida (redireciona a `/login`) |
| `app/actions.js` | Server Actions (login, CRUD, status, conversão proposta→OS); todas revalidam a sessão |
| `lib/db.js` | SQLite: `usuarios`, `clientes`, `ordens_servico`, `orcamentos` |
| `lib/queries.js` | Consultas SQL parametrizadas |
| `lib/share.js` | Resumo + links `wa.me` e `mailto:` |
| `app/(app)/…` | Telas autenticadas (início, clientes, os, orcamentos) |
| `app/(print)/…/imprimir` | Documento A4 para imprimir / salvar PDF |
| `app/globals.css` | Tema: `bg-dark` #121212, `brand-green` #39ff14 |

## Segurança

- Senha com scrypt; sessão em cookie `HttpOnly` assinado (HMAC-SHA256), 7 dias.
- Bloqueio de 15 min após 5 falhas de login (por IP + e-mail).
- Todo SQL é parametrizado; entradas validadas no servidor.
- Em produção com HTTPS, defina `COOKIE_SECURE=true`.
- Faça backup periódico da pasta `data/`.

# CENEP Conecta (MVP)

Plataforma Next.js + Supabase para alunos (perfil, currículo, candidaturas) e empresas (vagas e triagem de candidatos).

## Requisitos

- Node.js 20+
- Conta [Supabase](https://supabase.com) e projeto criado
- (Opcional) Conta [Vercel](https://vercel.com) para deploy

## Configuração local

```bash
cd cenep-conecta
cp .env.example .env.local
# Edite .env.local com URL e anon key do Supabase
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Banco de dados e Storage (Supabase)

### Migrations via Supabase CLI (recomendado)

A CLI está no projeto como devDependency. Fluxo típico (na pasta `cenep-conecta`):

1. `npx supabase login` — autentica no navegador com sua conta Supabase.
2. `npm run db:link` — associa este repositório ao projeto remoto. Você vai precisar do **Project ref** (em **Project Settings → General → Reference ID**, ou o trecho da URL `https://<ref>.supabase.co`) e da **senha do banco** definida na criação do projeto.
3. `npm run db:push` — aplica os arquivos em [`supabase/migrations/`](supabase/migrations/) ao Postgres remoto.

Comandos úteis: `npm run db:pull` (puxar schema remoto para revisão), `npm run db:diff` (gerar diff). Ver também `npx supabase --help`.

**Se você já rodou o SQL inteiro no SQL Editor**, o primeiro `db:push` pode falhar com “already exists”, porque o histórico da CLI (`supabase_migrations.schema_migrations`) não bate com o que foi aplicado à mão. Opções: projeto novo; ou marcar a migration como já aplicada com `npx supabase migration repair 20260407120000 --status applied` (número = prefixo do arquivo em `migrations/`); ou seguir o [guia de migrations](https://supabase.com/docs/guides/deployment/database-migrations).

Configuração local da CLI: [`supabase/config.toml`](supabase/config.toml) (gerado por `supabase init`).

### Alternativa: SQL Editor

1. No painel Supabase, abra **SQL Editor** e execute o conteúdo de [`supabase/migrations/20260407120000_initial.sql`](supabase/migrations/20260407120000_initial.sql) (tabelas `profiles`, `jobs`, `applications`, RLS, trigger de perfil, políticas de Storage).

2. Se o `INSERT` na tabela `storage.buckets` falhar por permissão, crie o bucket **curriculos** manualmente em **Storage** (privado) e mantenha as políticas RLS do arquivo SQL para `storage.objects` (ou reaplique só a parte das políticas após criar o bucket).

### Auth e e-mail

1. **Authentication → URL configuration**

   - **Site URL:** `http://localhost:3000` em desenvolvimento; em produção, a URL da Vercel (ex.: `https://seu-app.vercel.app`).
   - **Redirect URLs:** inclua  
     `http://localhost:3000/auth/callback`  
     `https://SEU_DOMINIO/auth/callback`  
     e o mesmo para recuperação de senha (o app usa `/auth/callback?next=/redefinir-senha`).

2. Com **confirmação de e-mail** ativada, novos usuários precisam confirmar antes de obter sessão; o cadastro exibe aviso nesse caso. Para testes rápidos, desative temporariamente em **Authentication → Providers → Email**.

(Esta subseção vale tanto para quem usa CLI quanto para quem aplicou o SQL pelo editor.)

## Deploy na Vercel

1. Conecte o repositório GitHub ao projeto na Vercel.
2. **Root directory:** `cenep-conecta` (se o repositório for a pasta pai `CENEP`).
3. Em **Environment Variables**, defina `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` com os mesmos valores do Supabase.
4. Atualize **Site URL** e **Redirect URLs** no Supabase com a URL de produção.

## Estrutura principal

| Área | Rotas |
|------|--------|
| Público | `/`, `/login`, `/cadastro`, `/recuperar-senha`, `/redefinir-senha` |
| Aluno | `/aluno/perfil`, `/aluno/vagas` |
| Empresa | `/empresa/vagas`, `/empresa/vagas/nova`, `/empresa/vagas/[id]/editar`, `/empresa/vagas/[id]/candidatos` |

O perfil do usuário é criado pelo trigger `handle_new_user` a partir dos metadados enviados no `signUp` (papel `aluno` ou `empresa`).

## Scripts

- `npm run dev` — desenvolvimento
- `npm run build` — build de produção
- `npm run start` — servir build
- `npm run lint` — ESLint
- `npm run supabase -- <comando>` — CLI (ex.: `npm run supabase -- projects list`)
- `npm run db:link` / `db:push` / `db:pull` / `db:diff` — atalhos Supabase (ver seção de migrations acima)

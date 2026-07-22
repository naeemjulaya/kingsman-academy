# Kingsman Academy

Plataforma académica em Next.js 16 e Supabase para estudantes, explicadores, coordenadores e administradores.

## Configuração local

1. Copie `.env.example` para `.env.local` e preencha as credenciais do projeto Supabase.
2. Aplique as migrations em `supabase/migrations` com o Supabase CLI (`supabase db push`) ou pelo SQL Editor, pela ordem dos ficheiros.
3. Instale e execute:

```bash
npm install
npm run dev
```

`SUPABASE_SERVICE_ROLE_KEY` é usada apenas em rotas server-side para criar/atualizar contas de explicadores. Nunca deve ser exposta no browser ou receber o prefixo `NEXT_PUBLIC_`.

## Verificação

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Fluxos administrativos

- Cadeiras e associação a explicadores são gravadas atomicamente por `admin_save_course`.
- Um estudante só pode ter uma inscrição por cadeira.
- A validação manual de pagamento e a inscrição são sincronizadas por `admin_validate_payment`.
- A ativação manual de uma inscrição confirma o respetivo estado de pagamento.
- Explicadores recebem uma conta própria no Supabase Auth; não são criados com o UUID do administrador.
- Redes sociais são configuradas em Administração > Configurações > Redes Sociais e apresentadas no rodapé público.

As funções administrativas voltam a validar o perfil `ADMIN` na base de dados; a proteção visual das páginas não é usada como barreira de segurança.

## YouTube

O player usa links embed e a rota `/api/lessons/[id]/video`, que valida sessão, matrícula ativa e pagamento confirmado. A `YOUTUBE_API_KEY` é opcional e só será necessária caso se use a YouTube Data API v3 para metadados ou gestão do canal.

## Materiais no Cloudflare R2

PDFs, e-books e fichas são guardados num bucket R2 privado. A aplicação gera URLs temporários para upload e download; materiais `PREMIUM` só são autorizados após confirmar matrícula e pagamento.

1. Crie um bucket privado chamado `kingsman-materials` no Cloudflare R2.
2. Crie credenciais S3 com leitura e escrita nesse bucket.
3. Configure `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` e `R2_BUCKET_NAME` no `.env.local` e na Vercel.
4. Aplique a migração `202607220004_r2_material_storage.sql`.
5. No bucket, configure CORS para o upload direto do browser, substituindo o domínio de produção:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://SEU-DOMINIO.vercel.app"
    ],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["Content-Type"]
  }
]
```

Nunca exponha `R2_SECRET_ACCESS_KEY` com o prefixo `NEXT_PUBLIC_`. O limite atual da aplicação é 50 MB por ficheiro e os formatos permitidos são PDF, EPUB, DOCX, PPTX, XLSX e ZIP.

## Login e registo sem palavra-passe

O fluxo principal usa `signInWithOtp` do Supabase. O utilizador informa o email e recebe um magic link que cria a conta ou inicia a sessão. A sessão é persistida em cookies pelo `@supabase/ssr` e recuperada com `getSession()` no cliente; as autorizações no servidor continuam a usar `getUser()`.

Em Authentication > URL Configuration, adicione à lista de Redirect URLs:

```text
http://localhost:3000/auth/callback
https://SEU-PROJETO.vercel.app/auth/callback
```

Na Vercel, defina `NEXT_PUBLIC_APP_URL` com o domínio real da implantação. O
callback de autenticação usa a origem atual do navegador, por isso não depende
de ngrok.

## Google OAuth opcional

Se futuramente for ativado, o mesmo callback também suporta Google OAuth. No Google Cloud, crie um cliente OAuth do tipo Web e use como URI de redirecionamento autorizada:

```text
https://erlnjhaqumsitxzcrcil.supabase.co/auth/v1/callback
```

No Supabase Dashboard, ative Authentication > Providers > Google e informe o Client ID e Client Secret.

O callback troca o código PKCE por uma sessão, cria o perfil `ESTUDANTE` quando necessário e encaminha perfis existentes para o dashboard correspondente à sua função.

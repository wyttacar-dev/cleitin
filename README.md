# Cleitin Cobrancas

App React/Vite com pet de produtividade, Supabase, IA via Groq e deploy preparado para Netlify.

## Rodar localmente

```bash
npm install
npm run dev
```

Em outro terminal, rode a API local:

```bash
npm run server
```

## Variaveis de ambiente

Copie `.env.example` para `.env` e configure o Supabase:

```bash
VITE_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_ANON_KEY
```

Copie `server/.env.example` para `server/.env` e configure a Groq:

```bash
GROQ_API_KEY=SUA_API_KEY
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
```

## Build

```bash
npm run build
```

## Netlify

O deploy usa Netlify Functions para `/api/health` e `/api/chat`.

No painel da Netlify, configure a variavel:

```bash
GROQ_API_KEY=SUA_API_KEY
```

# Iraq Compass Dashboard

Supabase-first React + Express dashboard for business data operations.

## Environment

Copy `.env.example` to `.env` and set:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GEMINI_API_KEY` (optional for AI enrichment features)
- `SUPABASE_URL` (server-side)
- `SUPABASE_SERVICE_ROLE_KEY` (server-side)

## Development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run lint
npm run build
```

## Architecture

- Frontend uses Supabase browser client (`src/lib/supabase.ts`).
- Auth is Supabase Auth only (`src/AuthContext.tsx`).
- Server APIs persist operational agent state in Supabase (`server.ts`).
- No Firebase runtime paths are retained.

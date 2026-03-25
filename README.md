# Iraq Business Verification & Enrichment System

Production-oriented full-stack dashboard + ingestion backend for collecting, normalizing, reviewing, and publishing Iraqi business records.

## Architecture Overview

- **Frontend**: React + Vite dashboard (`src/`) for overview, review table, task manager, export.
- **Backend**: Express server (`server.ts`, `server/`) with governor agents, source adapters, and Supabase persistence.
- **Database**: Canonical Supabase schema in `supabase_schema.sql` (mirrored in `schema.sql`).

Pipeline states are explicit:
1. `raw_business_records` (raw fetched payloads)
2. `businesses` in `review_state='candidate'`
3. `businesses` in `review_state='published'`

## Environment Variables

Copy `.env.example` to `.env` and fill values.

### Frontend (required)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Backend (required)
- `SUPABASE_SERVICE_ROLE_KEY`
- `PORT` (default `3000`)
- `NODE_ENV` (`development` or `production`)
- `DEMO_MODE` (`false` by default)

### External providers
- `GOOGLE_PLACES_API_KEY` (required for implemented restaurant governors)
- `GEMINI_API_KEY` (optional; AI post-processing integrations)

The backend validates required env vars at startup and exits on missing required values.

## Local Development

```bash
npm install
npm run dev
```

- Runs one Node process (`tsx server.ts`) with Vite middleware in dev mode.
- Open `http://localhost:3000`.

## Build & Run (Production)

```bash
npm run build
npm start
```

- `npm run build` builds frontend (`dist/`) and backend (`dist-server/`).
- `npm start` runs compiled Node server (`dist-server/server.js`) and serves static frontend assets.

## Database Setup (Supabase)

1. Open Supabase SQL editor.
2. Run `supabase_schema.sql`.
3. Confirm tables/policies exist:
   - `raw_business_records`
   - `businesses`
   - `agents`
   - `agent_tasks`
   - `agent_logs`

## Agent Design

Governors are configuration-driven (`server/governors/index.ts`) with explicit fields:
- governorate
- categories
- source adapters
- collection limit
- retry policy
- rate limit policy

If a source adapter is not implemented, the governor returns a clear error and does not fabricate records.

## Demo Mode

`DEMO_MODE` exists but defaults to `false`.

Current production flow does **not** silently emit mock businesses. If keys or adapters are missing, endpoints fail explicitly.

## Testing / Validation

```bash
npm run test
```

Runs lightweight sanity checks for:
- env config validation
- normalization
- deduplication
- confidence scoring

## Known Limitations

- Only restaurant collection via Google Places is implemented end-to-end.
- Other governor/source pairs are intentionally marked as not implemented (explicit errors) to avoid fake data.
- Frontend UI pages still contain legacy simulation components unrelated to backend ingestion paths; these should be incrementally migrated to backend API-backed status views.

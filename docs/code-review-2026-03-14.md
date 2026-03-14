# Iraq Compass Code Review (2026-03-14)

This review captures repository-level findings for app purpose, stack, quality, wiring status, and startup requirements.

## Key findings

- Frontend is React + Vite and talks directly to Supabase for `businesses` and `agents` reads.
- Backend is Express + TSX with crawler orchestration and agent endpoints.
- Crawler architecture and SQL migration are present, but several adapters/agents still use generated/mock data.
- Build/lint currently fail in this environment because `recharts` is imported but not installed in `node_modules`.
- Critical env vars are mostly documented in `.env.example`; `DISABLE_HMR` is referenced in `vite.config.ts` but undocumented (optional).


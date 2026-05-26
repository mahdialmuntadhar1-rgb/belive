# Belive: Supabase to Cloudflare Migration Guide

## Overview

This document describes the migration of the Belive application from Supabase to a pure Cloudflare stack. The migration has been completed and this guide serves as documentation for the new architecture.

## Migration Status: ✅ COMPLETE

The migration from Supabase to Cloudflare has been successfully completed. The application now runs entirely on Cloudflare infrastructure.

---

## Architecture Changes

### Before (Supabase)
- **Backend**: Express.js server
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Hosting**: Vite dev server

### After (Cloudflare)
- **Backend**: Cloudflare Workers (custom implementation)
- **Database**: Cloudflare D1 (SQLite)
- **Authentication**: Custom JWT (Workers + D1)
- **Storage**: Cloudflare R2
- **Hosting**: Cloudflare Pages (frontend) + Workers (backend)

---

## Database Schema

### D1 Tables

The following tables have been migrated from PostgreSQL to SQLite:

1. **users** - User accounts with password hashes
2. **businesses** - Business listings with multilingual support
3. **posts** - Social media posts from businesses
4. **post_comments** - Comments on posts
5. **reviews** - Business reviews
6. **claim_requests** - Business ownership claims
7. **categories** - Business categories (multilingual)
8. **features** - App features (multilingual)
9. **hero_slides** - Homepage hero slides (multilingual)
10. **governorates** - Iraqi governorates
11. **cities** - Cities within governorates
12. **password_resets** - Password reset tokens

### Type Conversions (PostgreSQL → SQLite)

| PostgreSQL | SQLite | Notes |
|------------|--------|-------|
| `uuid` | `TEXT` | Uses `crypto.randomUUID()` |
| `timestamptz` | `INTEGER` | Unix timestamp (milliseconds) |
| `boolean` | `INTEGER` | 0 = false, 1 = true |
| `jsonb` | `TEXT` | JSON string stored as text |
| `TEXT[]` | `TEXT` | JSON array stored as text |

---

## Authentication

### JWT Implementation

The custom JWT authentication uses:
- **Signing**: HMAC-SHA256
- **Secret**: Stored in Cloudflare Workers secret (`JWT_SECRET`)
- **Token Storage**: LocalStorage (`belive_token`, `belive_user`)
- **Expiration**: 7 days (configurable)

### Auth Endpoints

- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user
- `POST /auth/reset-password` - Request password reset
- `POST /auth/reset-password/confirm` - Confirm password reset

### Password Security

- **Hashing**: PBKDF2 with 100,000 iterations
- **Salt**: 16 random bytes per password
- **Algorithm**: SHA-256

---

## API Endpoints

### Businesses
- `GET /businesses` - List businesses (with filters)
- `GET /businesses/:id` - Get single business
- `POST /businesses` - Create business
- `PUT /businesses/:id` - Update business
- `DELETE /businesses/:id` - Delete business
- `GET /businesses/owned` - Get user's businesses
- `POST /businesses/:id/claim` - Claim business
- `GET /businesses/search?phone=...` - Search by phone
- `POST /businesses/bulk` - Bulk insert
- `GET /businesses/governorates` - Get governorates list

### Posts
- `GET /posts` - List posts
- `POST /posts` - Create post
- `PUT /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post
- `POST /posts/:id/like` - Like post
- `POST /posts/:id/comments` - Add comment

### Reviews
- `GET /reviews` - List reviews for business
- `POST /reviews` - Add review

### Metadata
- `GET /categories` - Get categories
- `POST /categories` - Create category
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category
- `GET /governorates` - Get governorates
- `GET /cities` - Get cities

### Hero Slides
- `GET /hero-slides` - List hero slides
- `POST /hero-slides` - Create hero slide
- `PUT /hero-slides/:id` - Update hero slide
- `DELETE /hero-slides/:id` - Delete hero slide

### Features
- `GET /features` - List features
- `POST /features` - Create feature
- `PUT /features/:id` - Update feature
- `DELETE /features/:id` - Delete feature

### Admin
- `GET /admin/summary` - Dashboard summary
- `GET /admin/businesses` - Search businesses
- `GET /admin/claim-requests` - List claim requests
- `PUT /admin/claim-requests/:id` - Handle claim request

### Upload
- `POST /upload` - Upload image to R2

---

## File Structure

```
belive-temp/
├── src/
│   ├── lib/
│   │   ├── api.ts              # Cloudflare Worker API client
│   │   └── supabaseClient.ts   # Stub (removed Supabase)
│   ├── components/             # React components
│   ├── pages/                  # React pages
│   └── ...
├── worker/                     # Cloudflare Worker
│   ├── src/
│   │   ├── handlers/           # API route handlers
│   │   │   ├── auth.ts
│   │   │   ├── businesses.ts
│   │   │   ├── posts.ts
│   │   │   ├── reviews.ts
│   │   │   ├── metadata.ts
│   │   │   ├── content.ts
│   │   │   ├── admin.ts
│   │   │   └── upload.ts
│   │   ├── index.ts            # Main worker entry
│   │   └── utils.ts            # JWT, password, CORS helpers
│   ├── schema.sql              # D1 database schema
│   ├── wrangler.toml           # Cloudflare config
│   └── package.json
├── scripts/
│   └── migrate-supabase-to-d1.ts  # Data migration script
├── package.json                # Frontend dependencies
└── .env.example                # Environment variables
```

---

## Deployment

### Prerequisites

1. **Cloudflare Account** with Workers, D1, R2, and Pages enabled
2. **Wrangler CLI** installed: `npm install -g wrangler`
3. **Git repository** connected to Cloudflare Pages

### Step 1: Set up D1 Database

```bash
cd worker
wrangler d1 create belive-db
```

Update `wrangler.toml` with the returned `database_id`.

### Step 2: Initialize Database Schema

```bash
cd worker
npm run db:init:remote
```

### Step 3: Set Secrets

```bash
cd worker
wrangler secret put JWT_SECRET
wrangler secret put RESEND_API_KEY  # Optional, for password reset emails
wrangler secret put ADMIN_EMAIL      # Optional, for admin role
```

### Step 4: Deploy Worker

```bash
cd worker
npm run deploy
```

### Step 5: Deploy Frontend to Pages

1. Connect your Git repository to Cloudflare Pages
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable: `VITE_API_URL=https://your-worker-url.workers.dev`
5. Deploy

---

## Data Migration (If Needed)

If you have existing data in Supabase that needs to be migrated:

### Step 1: Install Dependencies

```bash
npm install @supabase/supabase-js dotenv
```

### Step 2: Set Supabase Credentials

Create `.env` with:
```
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Step 3: Run Migration Script

```bash
npx tsx scripts/migrate-supabase-to-d1.ts
```

This generates `migration-output.sql`.

### Step 4: Import to D1

```bash
cd worker
wrangler d1 execute belive-db --file=../migration-output.sql --remote
```

---

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:8787  # Local dev
# or
VITE_API_URL=https://belive-api.workers.dev  # Production
```

### Worker Secrets (set via `wrangler secret put`)
- `JWT_SECRET` - Required for JWT signing
- `RESEND_API_KEY` - Optional, for password reset emails
- `ADMIN_EMAIL` - Optional, email that gets admin role on signup

### Worker Variables (in wrangler.toml)
- `CORS_ORIGIN` - Comma-separated list of allowed origins

---

## Local Development

### Start Worker (Backend)

```bash
cd worker
npm run dev
```

Worker runs at `http://localhost:8787`

### Start Frontend

```bash
# Root directory
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## Key Changes from Supabase

### Removed
- `@supabase/supabase-js` package
- Supabase Auth (replaced with custom JWT)
- Supabase Realtime (replaced with polling if needed)
- Supabase Storage (replaced with R2)
- Express server (replaced with Workers)

### Added
- Custom JWT authentication in `worker/src/utils.ts`
- D1 database queries in worker handlers
- R2 image upload in `worker/src/handlers/upload.ts`
- API client in `src/lib/api.ts`

---

## Testing

### Test Worker Health

```bash
curl http://localhost:8787/health
```

Should return: `{"status":"ok"}`

### Test Authentication

```bash
# Signup
curl -X POST http://localhost:8787/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:8787/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## Troubleshooting

### Worker fails to start
- Check that `wrangler.toml` has correct `database_id`
- Ensure secrets are set: `wrangler secret list`

### Frontend can't connect to Worker
- Check `VITE_API_URL` in `.env`
- Verify CORS origin in `wrangler.toml`

### D1 queries fail
- Ensure schema is initialized: `npm run db:init:remote`
- Check D1 dashboard for table structure

### Password reset emails not sending
- Set `RESEND_API_KEY` secret
- Verify Resend API key is valid

---

## Security Notes

1. **JWT Secret**: Use a strong, random secret (32+ characters)
2. **Password Hashing**: PBKDF2 with 100,000 iterations
3. **CORS**: Restrict to specific origins in production
4. **Rate Limiting**: Consider adding rate limiting to Workers
5. **Input Validation**: All inputs are validated in handlers

---

## Performance Considerations

- D1 has a 10ms read latency (best case)
- Workers have cold starts (~50ms)
- Consider caching frequently accessed data
- Use D1 batch operations for multiple inserts/updates

---

## Future Improvements

1. **Durable Objects**: For real-time features (if needed)
2. **KV Storage**: For caching frequently accessed data
3. **Analytics**: Add Cloudflare Analytics
4. **CDN**: Use Cloudflare CDN for static assets
5. **Rate Limiting**: Implement rate limiting per user/IP

---

## Support

For issues related to:
- **Cloudflare Workers**: https://developers.cloudflare.com/workers/
- **D1 Database**: https://developers.cloudflare.com/d1/
- **R2 Storage**: https://developers.cloudflare.com/r2/
- **Wrangler CLI**: https://developers.cloudflare.com/workers/wrangler/

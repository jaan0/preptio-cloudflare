# D1 Migration Plan

## Status: In Progress

### Current State
- Database: Neon Postgres (via `@prisma/adapter-neon`)
- Problem: Neon serverless driver incompatible with Cloudflare Workers
- Target: Cloudflare D1 (SQLite)

### Phase 1: Schema Conversion (Current)
- Convert `@db.Decimal(5, 2)` → `Float`
- Convert `String[]` / `Int[]` → `String` (comma-separated) or relation tables
- Convert raw PostgreSQL `DO $$` blocks → SQLite-compatible or Prisma queries
- Update `prisma/schema.prisma` provider to `sqlite`

### Phase 2: Prisma Client Adapter
- Replace `@prisma/adapter-neon` with `@prisma/adapter-d1`
- Update `lib/prisma.ts`

### Phase 3: D1 Binding & Config
- Create D1 database via `wrangler d1 create`
- Add `d1_databases` binding to `wrangler.jsonc`
- Add `DATABASE_URL` / D1 binding to Pages env vars

### Phase 4: Data Migration
- Export from Neon
- Transform for SQLite
- Import into D1

### Phase 5: Code Fixes
- `proxy.ts` IP blocking → fail open or use Prisma/D1
- `lib/ip-security.ts` → replace `node:net` `isIP` if needed
- All route handlers using `prisma` should work unchanged

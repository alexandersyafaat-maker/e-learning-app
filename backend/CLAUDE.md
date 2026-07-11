# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

E-Learning App backend — Indonesian high school (SMA) context. Roles: `ADMIN`, `GURU` (teacher), `SISWA` (student). All data models and API contracts are in [docs/MODELS.md](docs/MODELS.md) — treat it as ground truth for response shapes.

Frontend is a sibling project at `../frontend` (Next.js 16). It consumes this API at `http://localhost:8000/api` (so `PORT=8000`, `API_PREFIX=/api`). FE `grammar` and `kamus` features proxy external APIs (LanguageTool, dictionary) directly from FE server actions — **backend has no endpoints for them**.

## Task Tracking (WAJIB)

Task planning di [docs/TASKS.md](docs/TASKS.md). Setiap task selesai → langsung ubah `[ ]` → `[x]`, jangan batch. Kerjakan per-fase, ikuti urutan layer (`model → repository → service → controller → routes`).

## Seed

`npm run db:seed` — reset + isi akun (admin/2 guru/3 siswa, password `password123`) + 2 kelas. Akun admin: `admin@elearning.id`.

## Commands

```bash
npm run dev          # start dev server with hot-reload (nodemon + ts-node)
npm run build        # compile TypeScript → dist/
npm run start        # run compiled dist/server.js (production)
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run type-check   # tsc --noEmit (no emit, just type errors)
npm test             # Jest
npm run test:watch   # Jest watch mode
npm run db:seed      # run src/database/seed.ts
```

Run single test file: `npx jest src/modules/auth/auth.service.test.ts`

## Architecture

Strict 3-layer architecture. No layer may skip a layer below it.

```
src/
  server.ts               # HTTP server bootstrap, graceful shutdown
  app.ts                  # Express app factory — middleware stack, route mount
  config/
    env.ts                # Typed env loader — loads .env.{NODE_ENV}, throws at startup if vars missing
    database.ts           # Mongoose connect/disconnect with auto-retry
    logger.ts             # Winston logger singleton
  middlewares/
    auth.middleware.ts    # JWT verify → req.user
    role.middleware.ts    # requireRole(...roles) factory
    validate.middleware.ts # Zod schema validator for body/params/query
    error.middleware.ts   # Global error handler (last middleware in app.ts)
    upload.middleware.ts  # Multer config
  modules/
    <feature>/
      <feature>.controller.ts  # Parse req, call service, send res — no business logic
      <feature>.service.ts     # Business logic — calls repository, throws AppError
      <feature>.repository.ts  # All Mongoose calls — no logic beyond query
      <feature>.routes.ts      # Express Router — applies middlewares, maps to controller
      <feature>.types.ts       # Zod schemas + inferred TS types for this module
      <feature>.model.ts       # Mongoose Schema + Model
  utils/
    AppError.ts           # Custom error class with static factories
    response.ts           # sendSuccess / sendCreated / sendNoContent / sendError
    pagination.ts         # Shared pagination util
  types/
    express.d.ts          # Augment req.user type
  database/
    seed.ts               # DB seed script
```

Modules: `auth`, `akun`, `kelas`, `materi`, `latihan`, `tugas`, `pertemuan`, `vocab`

## Key Conventions

**Layer rules:**
- Controller: only `req`/`res`/`next` — delegates immediately to service
- Service: throws `AppError` for domain errors (e.g. `404 Not Found`, `403 Forbidden`)
- Repository: lets Mongoose errors bubble — error middleware catches them
- Never import Mongoose models outside of repository files

**Response shape** — always use helpers from `utils/response.ts`:
```typescript
// 200/201
{ success: true, data: T, message?: string }

// error — always has code + error; errors only present on VALIDATION_ERROR
{ success: false, code: ErrorCode, error: string, errors?: Record<string, string> }
```

**Error codes** — use constants from `constants/error-codes.ts`. Never hardcode strings.

**AppError** — throw via static factories: `AppError.notFound('Kelas')`, `AppError.forbidden()`, `AppError.validation(errors)`, `AppError.alreadySubmitted()`, etc.

**Validation errors** — `validate(schema)` middleware flattens `ZodError.issues` → `{ field: message }`, throws `AppError.validation(errors)`. Shape:
```json
{ "success": false, "code": "VALIDATION_ERROR", "error": "Validation failed", "errors": { "email": "Invalid email" } }
```

**Global error handler** (`middlewares/error.middleware.ts`) catches in order:
1. `AppError` → structured response
2. `TokenExpiredError` / `JsonWebTokenError` → 401
3. `mongoose.Error.ValidationError` → 400 with field errors
4. `mongoose.Error.CastError` → 400 (invalid ObjectId/format)
5. MongoDB duplicate key (`code 11000`) → 409
6. Unknown → log + 500

**Auth:**
- JWT in `Authorization: Bearer <token>` header OR httpOnly signed cookie `token`
- `req.user`: `{ userId: string; role: "ADMIN" | "GURU" | "SISWA"; name: string; email: string }`

**Validation:**
- Zod schemas defined in `<feature>.types.ts`
- Applied via `validate(schema)` middleware before controller method

**IDs:** UUID v4 via `uuid` package. Mongoose `_id` is ObjectId — always expose a separate `id: string` (UUID) field via schema virtual or explicit field.

**Dates:** Always ISO 8601 strings in responses. Mongoose returns `Date` objects — convert with `.toISOString()`.

**Pertemuan status:** Computed at response time from `jadwal + durasi` vs `Date.now()`. Never stored in DB.

**Vocab SRS:** SM-2 algorithm runs in `vocab.service.ts` on student rating submit. Formula is in docs/MODELS.md — implement exactly as specified.

**Lampiran (attachments):** Stored as Mongoose `Mixed` / typed embedded array on parent document. Type: `{ id, nama, ukuran, tipe, url }[]`.

**Zoom integration:** `pertemuan.service.ts` calls Zoom Server-to-Server OAuth API. Never expose `zoomStartUrl` to `SISWA` role.

## Environment

- Dev: `.env.development` | Prod: `.env.production`
- `config/env.ts` loads the correct file via `dotenv({ path: .env.${NODE_ENV} })`, validates with Zod, throws at startup if any required var is missing.
- `nodemon` sets `NODE_ENV=development` automatically.
- For prod: fill `.env.production` before deploying — especially `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `COOKIE_SECRET`.

## Database (MongoDB + Mongoose)

- `config/database.ts` exports `connectDatabase()` / `disconnectDatabase()`.
- `server.ts` calls `connectDatabase()` before `app.listen`.
- Graceful shutdown: closes HTTP server first, then `disconnectDatabase()`.
- Mongoose models live in `modules/<feature>/<feature>.model.ts`.

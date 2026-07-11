# TASKS.md — Backend Task Planning

> **Aturan:** Setiap task selesai diimplementasi, segera ubah `[ ]` → `[x]`. Jangan batch — tandai langsung setelah selesai, sebelum lanjut task berikutnya.
>
> **Arsitektur:** 3-layer `controller → service → repository`. Tiap modul: `model.ts`, `repository.ts`, `service.ts`, `controller.ts`, `routes.ts`, `types.ts` (Zod schema). Lihat [CLAUDE.md](../CLAUDE.md).
>
> **Kontrak API:** ground truth di [docs/MODELS.md](MODELS.md). Response shape: `{ success, data }` / `{ success, code, error, errors? }`.
>
> **Catatan:** Feature **Grammar** & **Kamus** di FE = proxy ke API eksternal (LanguageTool + dictionary API), dijalankan di FE server action. **Backend tidak perlu endpoint untuk keduanya.**

---

## Phase 0 — Project Setup ✅

- [x] `package.json` — Express + TypeScript + Mongoose, semua dependency production
- [x] `tsconfig.json` — strict mode, path alias `@/*`
- [x] `nodemon.json`, `.eslintrc.json`, `.prettierrc`, `jest.config.ts`
- [x] `.env.development` & `.env.production` + `src/config/env.ts` (validasi Zod, fail-fast)
- [x] `.gitignore` — exclude `.env.*`

---

## Phase 1 — Foundation / Shared ✅

- [x] `src/config/logger.ts` — Winston (dev: colorize, prod: JSON)
- [x] `src/config/database.ts` — Mongoose connect/disconnect + auto-retry + DNS fix
- [x] `src/constants/error-codes.ts` — `ERROR_CODES` konstanta
- [x] `src/utils/AppError.ts` — custom error + static factories
- [x] `src/utils/response.ts` — `sendSuccess/sendCreated/sendNoContent/sendError`
- [x] `src/utils/password.ts` — bcrypt hash/compare
- [x] `src/utils/mongoose.ts` — `uuidId`, `baseSchemaOptions` (expose `id`, strip `password`, dates → ISO)
- [x] `src/middlewares/validate.middleware.ts` — Zod validator (body/query/params)
- [x] `src/middlewares/error.middleware.ts` — global handler (AppError/JWT/Mongoose)
- [x] `src/app.ts` — Express factory (helmet, cors, rate-limit, compression, morgan, 404, error)
- [x] `src/server.ts` — bootstrap + graceful shutdown
- [x] `src/database/seed.ts` — seed admin/guru/siswa + kelas

### Sisa foundation
- [x] `src/types/express.d.ts` — augment `Request.user` type
- [x] `src/utils/pagination.ts` — helper paginasi (skip/limit/total)
- [x] `src/utils/jwt.ts` — sign/verify access + refresh token
- [x] `src/middlewares/auth.middleware.ts` — verify JWT (header/cookie) → `req.user`
- [x] `src/middlewares/role.middleware.ts` — `requireRole(...roles)` factory
- [x] `src/middlewares/upload.middleware.ts` — Multer config (lampiran)
- [x] `src/middlewares/async-handler.ts` — wrap async controller → forward error ke next()

---

## Phase 2 — Auth

### Model & Types
- [x] `src/modules/auth/user.model.ts` — `User` schema (name, email, password, role, avatarUrl)
- [x] `src/modules/auth/auth.types.ts` — Zod `LoginSchema`, tipe `JwtPayload`, `Session`

### Layer
- [x] `auth.repository.ts` — `findByEmail`, `findById`
- [x] `auth.service.ts` — `login` (verify password, sign token), `getSession`
- [x] `auth.controller.ts` — `login`, `logout`
- [x] `auth.routes.ts` — `POST /auth/login`, `POST /auth/logout`
- [x] Set httpOnly signed cookie `token` saat login; clear saat logout
- [x] Mount di `app.ts` + test login pakai akun seed
- [x] `POST /auth/me/avatar` — self-service ganti foto profil (semua role), hapus foto lama dari disk

---

## Phase 3 — Akun (Admin)

- [x] `akun.types.ts` — `CreateAkunSchema`, `UpdateAkunSchema` (password opsional saat update)
- [x] `akun.repository.ts` — CRUD user
- [x] `akun.service.ts` — hash password, cek email unik, exclude password di response
- [x] `akun.controller.ts` — list/create/update/delete
- [x] `akun.routes.ts` — `GET/POST /akun`, `PUT/DELETE /akun/:id` (semua `requireRole('ADMIN')`)

---

## Phase 4 — Kelas (Admin)

- [x] `src/modules/kelas/kelas.model.ts` — `Kelas` schema
- [x] `kelas.types.ts` — `CreateKelasSchema`, `UpdateKelasSchema`
- [x] `kelas.repository.ts` — CRUD
- [x] `kelas.service.ts` — business logic
- [x] `kelas.controller.ts` — list/getById/create/update/delete
- [x] `kelas.routes.ts` — `GET /kelas`, `GET /kelas/:id`, `POST/PUT/DELETE` (admin only utk mutasi)

---

## Phase 5 — Materi (Guru + Siswa)

- [x] `materi.model.ts` — `Materi` + embedded `lampiran[]`
- [x] `materi.types.ts` — `CreateMateriSchema`, `UpdateMateriSchema`, `LampiranSchema`
- [x] `materi.repository.ts` — query + filter `guruId`/`kelasId`, join nama (kelas/guru) → `MateriView`
- [x] `materi.service.ts` — CRUD + authz (guru hanya materi miliknya)
- [x] `materi.controller.ts` + `materi.routes.ts` — `GET /materi?guruId=|kelasId=`, `GET /materi/:id`, `POST/PUT/DELETE`
- [x] Endpoint upload lampiran (Multer) → return `Lampiran` shape

---

## Phase 6 — Latihan (Guru + Siswa)

- [x] `latihan.model.ts` — `Latihan` + `HasilLatihan` (jawaban siswa, nilai)
- [x] `latihan.types.ts` — Create/Update/Submit schema
- [x] `latihan.repository.ts` — latihan CRUD + hasil query
- [x] `latihan.service.ts`:
  - [x] Guru: CRUD latihan (authz milik sendiri)
  - [x] Siswa: list latihan + status submit (`LatihanWithStatus`)
  - [x] Siswa: submit jawaban (cek belum pernah submit, cek deadline)
  - [x] Guru: lihat semua hasil + beri nilai
- [x] Routes: `GET /latihan?guruId=`, `GET /latihan?kelasId=&siswaId=`, `GET /latihan/:id`, `POST/PUT/DELETE`, `GET /latihan/:id/hasil`, `GET /latihan/:id/hasil/:siswaId`, `POST /latihan/:id/submit`, `PATCH /latihan/:id/hasil/:hasilId/nilai`

---

## Phase 7 — Tugas (Guru + Siswa)

> Pola sama dengan Latihan: `latihan` → `tugas`, `hasil` → `submisi`, `jawaban` → `catatan`.

- [x] `tugas.model.ts` — `Tugas` + `SubmisiTugas`
- [x] `tugas.types.ts` — Create/Update/Submit schema
- [x] `tugas.repository.ts`
- [x] `tugas.service.ts` — mirror Latihan (CRUD, submit, nilai)
- [x] Routes: pola `/tugas` + `/tugas/:id/submisi`, `PATCH /tugas/:id/submisi/:submisiId/nilai`

---

## Phase 8 — Pertemuan Virtual (Zoom)

- [x] `pertemuan.model.ts` — simpan `zoomMeetingId/JoinUrl/StartUrl/Password` (status TIDAK disimpan)
- [x] `src/lib/zoom.client.ts` — Zoom Server-to-Server OAuth (get token, create/delete meeting)
- [x] `pertemuan.types.ts` — `CreatePertemuanSchema`
- [x] `pertemuan.repository.ts`
- [x] `pertemuan.service.ts`:
  - [x] Create → call Zoom API, simpan hasil
  - [x] Delete → call Zoom API delete
  - [x] Compute `status` (TERJADWAL/BERLANGSUNG/SELESAI) dari `jadwal + durasi` vs now
  - [x] **Strip `zoomStartUrl` untuk role SISWA**
- [x] Routes: `GET /pertemuan?guruId=|kelasId=`, `POST/DELETE`

---

## Phase 9 — Vocab SRS (SM-2)

- [x] `vocab.model.ts` — `VocabCard` (word, translation, V1-V3/ving/vs) + `SRSProgress`
- [x] `vocab.types.ts` — `CreateVocabSchema`, `ReviewSchema` (cardId, siswaId, quality 0-5)
- [x] `vocab.repository.ts` — card CRUD + progress upsert
- [x] `vocab.service.ts`:
  - [x] Guru: CRUD kartu
  - [x] Siswa review: hitung due + new (`VocabCardWithProgress`, `isDue`, `isNew`)
  - [x] **Implementasi SM-2** saat submit rating (lihat formula MODELS.md)
- [x] Routes: `GET /vocab?guruId=`, `GET /vocab/review?siswaId=`, `POST /vocab`, `DELETE /vocab/:id`, `POST /vocab/review`

---

## Phase 10 — Obrolan Grup per Materi (Guru + Siswa)

- [x] `obrolan.model.ts` — `IObrolan` (materiId, userId, userNama, userRole, teks), index `{ materiId, createdAt }`
- [x] `obrolan.types.ts` — `SendPesanSchema` (materiId, teks), `ObrolanQuerySchema` (materiId)
- [x] `obrolan.repository.ts` — `findPesanByMateri(materiId)`, `createPesan(data)`
- [x] `obrolan.service.ts`:
  - [x] `listPesan` — cek materi exist, return sorted by createdAt ASC
  - [x] `sendPesan` — authz: GURU harus owner materi, SISWA harus di kelas materi
- [x] `obrolan.controller.ts` — ambil userId/name/role dari `req.user`
- [x] Routes: `GET /obrolan?materiId=`, `POST /obrolan` — require GURU atau SISWA
- [x] Daftarkan di `app.ts`

---

## Phase 11 — Hardening / Production

- [x] Helmet, CORS (origin dari env), rate-limit, compression
- [x] Graceful shutdown (SIGTERM/SIGINT)
- [x] Structured logging (Winston)
- [x] CORS origin disamakan dengan FE (`http://localhost:3000`)
- [ ] Global request-id middleware (trace log)
- [x] Static serve folder `uploads/` (akses file lampiran)
- [x] Healthcheck sudah ada (`/health`) — tambah cek koneksi DB
- [ ] Dockerfile + `.dockerignore` (multi-stage build)
- [ ] Integration test per modul (Jest + supertest + mongodb-memory-server)
- [ ] CI pipeline (lint + type-check + test)

---

## Phase 11 — Integrasi FE ↔ Backend

- [x] `src/lib/api.ts` (FE) — `apiFetch<T>` + `apiDelete` helper dengan auth header dari cookie `token`
- [x] `src/features/auth/actions/login.action.ts` — call backend `/auth/login`, simpan `session` + `token` cookie
- [x] `src/features/auth/actions/logout.action.ts` — call backend `/auth/logout`, hapus kedua cookie
- [x] `GET /auth/me` — endpoint baru (backend), pakai `authenticate` middleware
- [x] `user.model.ts` + seed — tambah `kelasId` ke User (siswa → kelas)
- [x] `auth.middleware.ts` + `jwt.ts` + `express.d.ts` — propagate `kelasId` di JWT payload → `req.user`
- [x] `akun.repository.ts` — `findKelasIdBySiswaId()` helper
- [x] Semua service (materi/latihan/tugas/pertemuan/vocab) — auto-resolve `kelasId` dari `siswaId`
- [x] Semua FE `*.service.ts` — switch dari dummy ke real `apiFetch` calls
- [x] Semua FE action files — switch import `.dummy` → `.service`
- [x] FE `Session` type — tambah `kelasId?: string`
- [x] `npm run db:seed` — siswa dapat `kelasId` di DB

## Catatan Integrasi FE

- FE expect `API_URL=http://localhost:8000/api` → backend `PORT=8000`, `API_PREFIX=/api` ✅
- FE kirim/terima role `ADMIN | GURU | SISWA`
- FE `ActionResponse<T>` = `{ success, data }` / `{ success, error }` — backend tambah `code` + `errors` (superset, kompatibel)
- Saat FE switch dari `.dummy` ke `.service`: pastikan shape response backend == tipe di `features/*/types`

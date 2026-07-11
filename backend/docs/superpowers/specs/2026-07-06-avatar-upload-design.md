# Design: Ganti Foto Profil (Avatar Upload)

Date: 2026-07-06

## Goal

Semua role (ADMIN, GURU, SISWA) bisa ganti foto profil sendiri lewat dropdown
di icon avatar Topbar dashboard. Menyentuh dua repo sibling: `backend` (endpoint
upload) dan `frontend` (UI dropdown + modal upload).

## Backend (`c:/Alex-sistem/E-Learning-app/backend`)

### Endpoint baru: `POST /api/auth/me/avatar`

- Middleware: `authenticate` saja — self-service, pakai `req.user.userId` dari
  JWT, tanpa param `:id`.
- Body: `multipart/form-data`, field `foto` (single image file).
- Validasi tipe file: image only (`jpeg`, `png`, `gif`, `webp`) via multer
  instance baru `uploadAvatar` (fileFilter khusus image), reuse `diskStorage`
  dan `MAX_FILE_SIZE_MB` yang sudah ada di `upload.middleware.ts`.
- Behavior: hapus file avatar lama dari disk kalau ada (safe-fail unlink, tidak
  melempar error kalau file tak ketemu), update `user.avatarUrl` di DB, return
  `Session` ter-update (termasuk `avatarUrl`).
- Response: `{ success: true, data: Session, message: 'Foto profil berhasil diperbarui' }`
- No file → `400` dengan pola sama seperti controller lampiran existing
  (materi/tugas/latihan).

### Files touched

- `src/middlewares/upload.middleware.ts` — tambah `uploadAvatar` (multer
  instance, image-only fileFilter) + helper `deleteUploadedFile(url: string)`
  (derive filename dari URL, `fs.unlink` dibungkus try/catch, abaikan ENOENT).
- `src/modules/auth/auth.types.ts` — tambah `avatarUrl?: string` ke `Session`.
- `src/modules/auth/auth.repository.ts` — tambah
  `updateAvatar(userId: string, avatarUrl: string)` via
  `UserModel.findByIdAndUpdate(id, { avatarUrl }, { new: true })`.
- `src/modules/auth/auth.service.ts`:
  - `updateAvatar(userId, avatarUrl)` — fetch user via `findById`, kalau ada
    `avatarUrl` lama panggil `deleteUploadedFile`, lalu `repository.updateAvatar`,
    return `Session` baru.
  - `getSessionById` — tambahkan `avatarUrl: user.avatarUrl` ke return value.
- `src/modules/auth/auth.controller.ts`:
  - `uploadAvatarController` — baru, pola sama seperti
    `uploadLampiranController` (cek `req.file`, build `baseUrl`, panggil
    service, `sendSuccess`).
  - `meController` — ubah dari `sendSuccess(res, req.user)` (raw JWT decode)
    jadi `sendSuccess(res, await getSessionById(req.user.userId))` supaya
    `avatarUrl` (dan field lain) selalu fresh dari DB, tidak stale dari token
    lama.
- `src/modules/auth/auth.routes.ts` — tambah
  `router.post('/me/avatar', authenticate, uploadAvatar.single('foto'), uploadAvatarController)`.

### Docs

- `docs/MODELS.md` — tambah `avatarUrl?: string` ke `Session` interface (Feature
  Auth), tambah baris endpoint `POST /auth/me/avatar` di tabel endpoint Auth.
- `docs/TASKS.md` — tambah checklist item baru di bawah Phase 2 — Auth untuk
  endpoint ini, langsung dicentang `[x]` setelah implementasi selesai (sesuai
  aturan project: task selesai langsung diubah, jangan batch).

## Frontend (`c:/Alex-sistem/E-Learning-app/frontend`)

### `src/components/layout/Topbar.tsx`

- Avatar circle dibungkus `<button>` yang toggle state dropdown (`useState`).
- Dropdown (hand-rolled, konsisten dengan pola modal existing — bukan pakai
  library, karena belum ada primitive Dropdown/Menu di codebase):
  - Item 1: "Ganti Foto Profil" → buka `AvatarUploadModal`.
  - Item 2: "Logout" → `<form action={logoutAction}>`, reuse
    `logoutAction` yang sudah ada di `features/auth/actions/logout.action.ts`
    (tidak duplikasi logic, hanya dipanggil ulang — sudah dipakai juga di
    Sidebar).
  - Klik di luar dropdown menutup dropdown (backdrop transparent atau
    `onBlur`/click-outside listener sederhana).
- Kalau `session.avatarUrl` ada, render `<img src={session.avatarUrl} className="w-8 h-8 rounded-full object-cover" />`
  menggantikan div inisial; kalau tidak, fallback ke inisial seperti sekarang.

### `src/features/auth/components/AvatarUploadModal.tsx` (baru)

- Client component, modal hand-rolled (`fixed inset-0 bg-black/50 z-50 flex
  items-center justify-center`), pola sama seperti `KelasFormModal` /
  `AkunFormModal`.
- `<input type="file" accept="image/*">`, preview live via
  `URL.createObjectURL`.
- Submit memanggil server action `uploadAvatarAction(formData)`.
- Sukses → tutup modal, panggil `router.refresh()` (re-render layout server
  component → baca ulang cookie `session` yang sudah di-update → avatarUrl baru
  mengalir turun ke Topbar).
- Gagal → tampilkan pesan error inline (pola sama seperti `FormError.tsx`).

### `src/lib/upload.ts`

- Tambah fungsi `uploadAvatarFile(file: File): Promise<{ avatarUrl?: string } & Record<string, unknown>>`
  mengikuti pola `uploadLampiranFiles` (FormData, field `foto`, POST ke
  `/auth/me/avatar`, unwrap `{success, data}`, lempar `Error` kalau gagal).
  Return value adalah `Session` hasil endpoint (berisi `avatarUrl`).

### `src/features/auth/actions/upload-avatar.action.ts` (baru)

- `"use server"`.
- Ambil file dari `FormData`, panggil `uploadAvatarFile`.
- Sukses → baca cookie `session` saat ini, merge `avatarUrl` baru, `cookies().set('session', ..., COOKIE_OPTS)` (opsi sama seperti di `login.action.ts`).
- Return `ActionResponse<{ avatarUrl: string }>`.

### `src/features/auth/types/auth.types.ts`

- Tambah `avatarUrl?: string` ke `Session`.

### `src/features/auth/actions/login.action.ts`

- Sertakan `avatarUrl: user.avatarUrl` saat build cookie `session` di kedua
  branch (real-backend dan dummy fallback — dummy branch cukup `undefined` kalau
  tak ada data), supaya `avatarUrl` sudah ada sejak login pertama.

## Error Handling

- Tipe file salah / ukuran lebih besar dari limit → error dari multer
  `fileFilter`/`limits` → bubble ke `error.middleware.ts` existing → response
  JSON `{success:false, ...}` → FE server action tangkap via `try/catch` dan
  tampilkan pesan di modal.
- Tidak ada file terkirim → controller balas `400` (pola sama seperti endpoint
  lampiran existing).

## Testing

- Backend: `npm run dev`, uji manual multipart upload sebagai tiap role
  (curl/Postman), verifikasi `avatarUrl` ter-update di DB, file lama terhapus
  dari disk, `/auth/me` merefleksikan perubahan.
- Frontend: `npm run dev`, login sebagai siswa/guru/admin, klik avatar →
  dropdown → "Ganti Foto Profil" → upload gambar → avatar ter-update setelah
  refresh, tetap persisten setelah reload halaman.

# TASKS.md — Project Task Planning

> **Aturan:** Setiap task yang selesai diimplementasi, segera ubah `[ ]` → `[x]`. Jangan batch — tandai langsung setelah selesai, sebelum lanjut ke task berikutnya.

---

## Phase 0 — Project Setup

- [x] Install dependencies: `zustand`, `sonner`, `clsx`, `tailwind-merge`, `lucide-react`
- [x] Buat folder structure: `src/features/`, `src/components/`, `src/lib/`, `src/stores/`
- [x] Tambah font Inter di `layout.tsx` (ganti Geist)
- [x] Buat `src/lib/types.ts` — shared types: `ActionResponse<T>`, `BaseEntity`
- [x] Buat `src/lib/utils.ts` — shared utilities (cn/classnames helper, dll.)

---

## Phase 1 — Auth

### Types & Data
- [x] Buat `src/features/auth/types/auth.types.ts` — `User`, `Role` enum (`ADMIN | GURU | SISWA`), `Session`
- [x] Buat `src/features/auth/services/auth.dummy.ts` — dummy users + `fetchCurrentUser()`, `loginRequest()`
- [x] Buat `src/features/auth/services/auth.service.ts` — real service (stub, signature sama dengan dummy)

### Store & Actions
- [x] Buat `src/stores/auth.store.ts` — zustand store: `currentUser`, `setCurrentUser`, `clearUser`
- [x] Buat `src/features/auth/actions/login.action.ts` — server action login, return `ActionResponse<User>`
- [x] Buat `src/features/auth/actions/logout.action.ts` — server action logout, clear session

### UI
- [x] Buat `src/app/(auth)/login/page.tsx` — halaman login (centered card, no sidebar)
- [x] Buat `src/features/auth/components/LoginForm.tsx` — form email + password + submit button
- [x] Buat `src/proxy.ts` — route protection berdasarkan role, redirect ke `/login` jika belum auth (Next.js 16: middleware → proxy)

---

## Phase 2 — Layout Shell

### Komponen
- [x] Buat `src/components/layout/Sidebar.tsx` — sidebar fixed kiri, role-aware nav items
- [x] Buat `src/components/layout/Topbar.tsx` — topbar sticky, avatar + nama user, hamburger mobile
- [x] Buat `src/components/layout/SidebarNav.tsx` — nav items list per role
- [x] Buat `src/stores/ui.store.ts` — zustand store: `sidebarOpen`, `toggleSidebar`, `closeSidebar`

### Layout Route Group
- [x] Buat `src/app/(dashboard)/layout.tsx` — shell layout: sidebar + topbar + main content
- [x] Pastikan responsive: mobile sidebar overlay dengan backdrop, desktop sidebar fixed

---

## Phase 3 — Dashboard

- [ ] Buat `src/features/dashboard/types/dashboard.types.ts` — `StatCard`, `RecentActivity`
- [ ] Buat `src/features/dashboard/services/dashboard.dummy.ts` — dummy stats per role
- [ ] Buat `src/features/dashboard/components/StatCard.tsx` — stat card component
- [ ] Buat `src/app/(dashboard)/dashboard/page.tsx` — dashboard page, fetch stats, render grid stat cards

---

## Phase 4 — Akun (Administrator)

### Types & Data
- [x] Buat `src/features/akun/types/akun.types.ts` — `Akun`, `CreateAkunInput`, `UpdateAkunInput`
- [x] Buat `src/features/akun/services/akun.dummy.ts` — dummy list akun + CRUD mock functions
- [x] Buat `src/features/akun/services/akun.service.ts` — real service stub

### Actions
- [x] Buat `src/features/akun/actions/create-akun.action.ts` — server action, return `ActionResponse<Akun>`
- [x] Buat `src/features/akun/actions/update-akun.action.ts` — server action, return `ActionResponse<Akun>`
- [x] Buat `src/features/akun/actions/delete-akun.action.ts` — server action, return `ActionResponse<void>`

### UI
- [x] Buat `src/app/(dashboard)/admin/akun/page.tsx` — fetch list, render tabel
- [x] Buat `src/features/akun/components/AkunTable.tsx` — tabel dengan search, client-side filter
- [x] Buat `src/features/akun/components/AkunFormModal.tsx` — modal tambah/edit akun
- [x] Buat `src/features/akun/components/DeleteAkunDialog.tsx` — konfirmasi dialog hapus
- [x] Buat `src/features/akun/stores/akun-ui.store.ts` — state: `selectedAkun`, `modalOpen`, `deleteTargetId`

---

## Phase 5 — Kelas (Administrator)

### Types & Data
- [x] Buat `src/features/kelas/types/kelas.types.ts` — `Kelas`, `CreateKelasInput`, `UpdateKelasInput`
- [x] Buat `src/features/kelas/services/kelas.dummy.ts` — dummy kelas + CRUD mock
- [x] Buat `src/features/kelas/services/kelas.service.ts` — real service stub

### Actions
- [x] Buat `src/features/kelas/actions/create-kelas.action.ts`
- [x] Buat `src/features/kelas/actions/update-kelas.action.ts`
- [x] Buat `src/features/kelas/actions/delete-kelas.action.ts`

### UI
- [x] Buat `src/app/(dashboard)/admin/kelas/page.tsx`
- [x] Buat `src/features/kelas/components/KelasTable.tsx`
- [x] Buat `src/features/kelas/components/KelasFormModal.tsx`
- [x] Buat `src/features/kelas/components/DeleteKelasDialog.tsx`
- [x] Buat `src/features/kelas/stores/kelas-ui.store.ts`

---

## Phase 6 — Materi (Guru + Siswa)

### Types & Data
- [x] Buat `src/features/materi/types/materi.types.ts` — `Materi`, `CreateMateriInput`, `UpdateMateriInput`
- [x] Buat `src/features/materi/services/materi.dummy.ts` — dummy materi + CRUD mock + fetch by kelas
- [x] Buat `src/features/materi/services/materi.service.ts` — real service stub

### Actions (Guru)
- [x] Buat `src/features/materi/actions/create-materi.action.ts`
- [x] Buat `src/features/materi/actions/update-materi.action.ts`
- [x] Buat `src/features/materi/actions/delete-materi.action.ts`

### UI Guru
- [x] Buat `src/app/(dashboard)/guru/materi/page.tsx` — list materi milik guru ini
- [x] Buat `src/features/materi/components/MateriTable.tsx`
- [x] Buat `src/features/materi/components/MateriFormModal.tsx`
- [x] Buat `src/features/materi/components/DeleteMateriDialog.tsx`
- [x] Buat `src/features/materi/stores/materi-ui.store.ts`

### UI Siswa
- [x] Buat `src/app/(dashboard)/siswa/materi/page.tsx` — grid card materi per kelas siswa
- [x] Buat `src/features/materi/components/MateriCard.tsx` — card untuk grid siswa
- [x] Buat `src/app/(dashboard)/siswa/materi/[id]/page.tsx` — halaman detail/baca materi

---

## Phase 7 — Latihan (Guru + Siswa)

### Types & Data
- [ ] Buat `src/features/latihan/types/latihan.types.ts` — `Latihan`, `Soal`, `Jawaban`, `HasilLatihan`, `CreateLatihanInput`
- [ ] Buat `src/features/latihan/services/latihan.dummy.ts` — dummy latihan + soal + hasil
- [ ] Buat `src/features/latihan/services/latihan.service.ts` — real service stub

### Actions (Guru)
- [ ] Buat `src/features/latihan/actions/create-latihan.action.ts`
- [ ] Buat `src/features/latihan/actions/update-latihan.action.ts`
- [ ] Buat `src/features/latihan/actions/delete-latihan.action.ts`

### Actions (Siswa)
- [ ] Buat `src/features/latihan/actions/submit-latihan.action.ts` — submit jawaban, return `ActionResponse<HasilLatihan>`

### UI Guru
- [ ] Buat `src/app/(dashboard)/guru/latihan/page.tsx`
- [ ] Buat `src/features/latihan/components/LatihanTable.tsx`
- [ ] Buat `src/features/latihan/components/LatihanFormModal.tsx` — termasuk form tambah soal
- [ ] Buat `src/features/latihan/stores/latihan-ui.store.ts`

### UI Siswa
- [ ] Buat `src/app/(dashboard)/siswa/latihan/page.tsx` — list latihan tersedia
- [ ] Buat `src/app/(dashboard)/siswa/latihan/[id]/page.tsx` — halaman kerjakan latihan
- [ ] Buat `src/features/latihan/components/SoalItem.tsx` — single soal + pilihan jawaban
- [ ] Buat `src/features/latihan/components/LatihanSubmitFooter.tsx` — sticky footer: progress + tombol submit
- [ ] Buat `src/features/latihan/stores/latihan-siswa.store.ts` — state: `jawaban[]`, `currentSoal`

---

## Phase 8 — Tugas (Guru + Siswa)

### Types & Data
- [ ] Buat `src/features/tugas/types/tugas.types.ts` — `Tugas`, `SubmisiTugas`, `CreateTugasInput`, `StatusSubmisi`
- [ ] Buat `src/features/tugas/services/tugas.dummy.ts` — dummy tugas + submisi
- [ ] Buat `src/features/tugas/services/tugas.service.ts` — real service stub

### Actions (Guru)
- [ ] Buat `src/features/tugas/actions/create-tugas.action.ts`
- [ ] Buat `src/features/tugas/actions/update-tugas.action.ts`
- [ ] Buat `src/features/tugas/actions/delete-tugas.action.ts`

### Actions (Siswa)
- [ ] Buat `src/features/tugas/actions/submit-tugas.action.ts` — return `ActionResponse<SubmisiTugas>`

### UI Guru
- [ ] Buat `src/app/(dashboard)/guru/tugas/page.tsx`
- [ ] Buat `src/features/tugas/components/TugasTable.tsx`
- [ ] Buat `src/features/tugas/components/TugasFormModal.tsx`
- [ ] Buat `src/app/(dashboard)/guru/tugas/[id]/submisi/page.tsx` — lihat semua submisi siswa
- [ ] Buat `src/features/tugas/components/SubmisiTable.tsx`
- [ ] Buat `src/features/tugas/stores/tugas-ui.store.ts`

### UI Siswa
- [ ] Buat `src/app/(dashboard)/siswa/tugas/page.tsx` — list tugas + status (belum/sudah)
- [ ] Buat `src/app/(dashboard)/siswa/tugas/[id]/page.tsx` — halaman kerjakan/submit tugas
- [ ] Buat `src/features/tugas/components/TugasDetailCard.tsx` — info tugas + deadline badge
- [ ] Buat `src/features/tugas/components/TugasSubmitForm.tsx` — form upload/teks jawaban

---

## Phase 9 — Nilai (Guru + Siswa)

### Types & Data
- [x] Buat `src/features/nilai/types/nilai.types.ts` — `HasilLatihanNilai`, `SubmisiTugasNilai`, `NilaiSiswa`, `UpdateNilaiInput`
- [x] Buat `src/features/nilai/services/nilai.dummy.ts` — dummy nilai per siswa per latihan/tugas
- [x] Buat `src/features/nilai/services/nilai.service.ts` — real service stub

### Actions (Guru)
- [x] Buat `src/features/nilai/actions/update-hasil-latihan-nilai.action.ts`
- [x] Buat `src/features/nilai/actions/update-submisi-tugas-nilai.action.ts`

### UI Guru
- [x] Buat `src/app/(dashboard)/guru/nilai/page.tsx` — tabel nilai semua siswa, filter by kelas
- [x] Buat `src/features/nilai/components/NilaiTable.tsx` — tabbed table latihan/tugas + filter kelas
- [x] Buat `src/features/nilai/components/NilaiBeriModal.tsx` — modal input nilai + tampilkan jawaban siswa
- [x] Buat `src/features/nilai/stores/nilai-ui.store.ts`

### UI Siswa
- [x] Buat `src/app/(dashboard)/siswa/nilai/page.tsx` — tabel nilai pribadi siswa + download PDF
- [x] Buat `src/features/nilai/components/NilaiBadge.tsx` — badge warna (merah/kuning/hijau)
- [x] Buat `src/features/nilai/components/NilaiSiswaTable.tsx` — dua section latihan+tugas + rata-rata + tombol print
- [x] Buat `src/features/nilai/components/NilaiPrintView.tsx` — print-only layout untuk PDF via window.print()

---

## Phase 10 — Obrolan Grup per Materi (Guru + Siswa)

### Types & Data
- [x] Buat `src/features/obrolan/types/obrolan.types.ts` — `PesanObrolan`, `SendPesanInput`
- [x] Buat `src/features/obrolan/services/obrolan.dummy.ts` — dummy pesan per materiId
- [x] Buat `src/features/obrolan/services/obrolan.service.ts` — real service stub (`GET /obrolan?materiId=`, `POST /obrolan`)

### Actions
- [x] Buat `src/features/obrolan/actions/send-pesan.action.ts` — server action kirim pesan, return `ActionResponse<PesanObrolan>`

### UI
- [x] Buat `src/features/obrolan/components/ObrolanBox.tsx` — client component: tampil bubble chat + form kirim pesan
- [x] Buat `src/app/(dashboard)/guru/materi/[id]/page.tsx` — halaman detail materi guru + ObrolanBox
- [x] Update `src/app/(dashboard)/siswa/materi/[id]/page.tsx` — tambah ObrolanBox di bawah konten materi
- [x] Update `src/features/materi/components/MateriTable.tsx` — tambah tombol obrolan (MessageSquare icon) ke tabel guru

---

## Phase 11 — Polish & Finalisasi

### Shared Components
- [ ] Buat `src/components/ui/Toast.tsx` — setup sonner `<Toaster />` di root layout
- [ ] Buat `src/components/ui/Skeleton.tsx` — skeleton pulse reusable
- [ ] Buat `src/components/ui/EmptyState.tsx` — empty state reusable dengan icon + teks + optional CTA
- [ ] Buat `src/components/ui/ConfirmDialog.tsx` — reusable konfirmasi dialog (gantikan per-feature delete dialog)
- [ ] Buat `src/components/ui/Badge.tsx` — reusable badge dengan variant prop

### QA
- [ ] Cek responsive semua halaman (mobile / tablet / desktop)
- [ ] Pastikan semua server action return `ActionResponse<T>` konsisten
- [ ] Pastikan semua halaman GET fetch di server (`page.tsx`), tidak ada fetch di client component
- [ ] Pastikan semua dummy data import bisa swap 1 baris ke real service
- [ ] `npm run lint` — 0 error, 0 warning
- [ ] `npm run build` — build berhasil tanpa error

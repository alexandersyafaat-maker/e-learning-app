# DESIGN.md — E-Learning App UI/UX Reference

Selalu baca file ini sebelum implementasi komponen atau halaman baru.

---

## Design Principles

- **Clarity over decoration** — informasi mudah dipindai, tidak ada elemen dekoratif tanpa fungsi
- **Role-aware** — layout dan navigasi berbeda per actor (Admin / Guru / Siswa)
- **Mobile-first** — desain dari layar kecil, scale up ke desktop
- **Konsistensi** — gunakan komponen dan spacing dari sistem ini, jangan ad-hoc

---

## Color Palette

```
Primary     : Indigo-600  #4F46E5   (aksi utama, link aktif, brand)
Primary Hover: Indigo-700  #4338CA
Secondary   : Slate-700   #334155   (sidebar bg, teks sekunder)
Accent      : Violet-500  #8B5CF6   (highlight, badge penting)

Surface     : White        #FFFFFF   (card, modal bg)
Background  : Slate-50    #F8FAFC   (page background)
Border      : Slate-200   #E2E8F0

Text Primary  : Slate-900  #0F172A
Text Secondary: Slate-500  #64748B
Text Disabled : Slate-300  #CBD5E1

Success : Emerald-500  #10B981
Warning : Amber-500    #F59E0B
Error   : Red-500      #EF4444
Info    : Sky-500      #0EA5E9
```

Tailwind class map:
```
bg-primary       → bg-indigo-600
hover:bg-primary → hover:bg-indigo-700
text-primary     → text-indigo-600
border-primary   → border-indigo-600
sidebar bg       → bg-slate-800
sidebar active   → bg-indigo-600
page bg          → bg-slate-50
```

---

## Typography

Font: **Inter** (system sans-serif fallback).

```
Heading 1  : text-2xl font-bold text-slate-900        (judul halaman)
Heading 2  : text-xl  font-semibold text-slate-800    (section title)
Heading 3  : text-base font-semibold text-slate-700   (card title)
Body       : text-sm  font-normal text-slate-600
Caption    : text-xs  font-normal text-slate-500
Label form : text-sm  font-medium text-slate-700
```

---

## Spacing Scale

Gunakan Tailwind spacing. Jangan pakai nilai arbitrary kecuali terpaksa.

```
XS  : p-1   gap-1   (4px)
SM  : p-2   gap-2   (8px)
MD  : p-4   gap-4   (16px)  ← default inner padding card
LG  : p-6   gap-6   (24px)  ← page section gap
XL  : p-8   gap-8   (32px)
2XL : p-12  gap-12  (48px)
```

---

## Layout

### Shell (semua halaman setelah login)

```
┌─────────────────────────────────────────────┐
│  SIDEBAR (fixed, w-64)  │  MAIN CONTENT     │
│                         │                   │
│  [Logo + App Name]      │  [Topbar]         │
│  ─────────────          │  ─────────────    │
│  nav item               │  [Page Header]    │
│  nav item (active)      │  [Page Content]   │
│  nav item               │                   │
│  ─────────────          │                   │
│  [User Info]            │                   │
│  [Logout]               │                   │
└─────────────────────────────────────────────┘
```

- **Sidebar**: `w-64 bg-slate-800 text-white fixed h-screen flex flex-col`
- **Main**: `ml-64 min-h-screen bg-slate-50`
- **Mobile** (`< md`): sidebar hidden, topbar tampilkan hamburger button → sidebar overlay dengan backdrop

### Topbar

```
┌─────────────────────────────────────────────┐
│ [Hamburger*]  Breadcrumb              [Avatar + Nama] │
└─────────────────────────────────────────────┘
```
`*` hanya muncul di mobile.
Class: `h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10`

### Page Header

```
┌─────────────────────────────────────────────┐
│ Judul Halaman                [+ Tambah Baru]│
│ Deskripsi singkat (opsional)                │
└─────────────────────────────────────────────┘
```
Class: `flex items-center justify-between mb-6`

---

## Sidebar Navigation per Role

### Administrator
```
📊 Dashboard
👥 Kelola Akun
🏫 Kelola Kelas
```

### Guru
```
📊 Dashboard
📚 Kelola Materi
📝 Kelola Latihan
📋 Kelola Tugas
🎯 Kelola Nilai
```

### Siswa
```
📊 Dashboard
📚 Materi
📝 Latihan
📋 Tugas
🎯 Nilai Saya
```

Nav item styling:
```
default : flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors
active  : flex items-center gap-3 px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-medium
```

---

## Component Patterns

### Card

```
<div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
```

### Button

```
Primary   : bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors
Secondary : bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium
Danger    : bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium
Ghost     : hover:bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium
Icon only : p-2 rounded-lg hover:bg-slate-100 text-slate-500
```

### Badge / Status

```
default   : inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
Success   : bg-emerald-100 text-emerald-700
Warning   : bg-amber-100 text-amber-700
Error     : bg-red-100 text-red-700
Info      : bg-sky-100 text-sky-700
Neutral   : bg-slate-100 text-slate-600
```

### Data Table

```
┌──────────────────────────────────────────────────┐
│ [Search input]                    [+ Tambah Baru]│
├──────┬──────────────┬────────┬───────────────────┤
│  No  │ Nama         │ Status │ Aksi              │
├──────┼──────────────┼────────┼───────────────────┤
│  1   │ ...          │ badge  │ [Edit] [Hapus]    │
│  2   │ ...          │ badge  │ [Edit] [Hapus]    │
└──────┴──────────────┴────────┴───────────────────┘
│ Showing 1-10 of 24              [< Prev] [Next >]│
└──────────────────────────────────────────────────┘
```

Table class:
```
wrapper : overflow-hidden rounded-xl border border-slate-200 bg-white
thead   : bg-slate-50 text-xs font-medium text-slate-500 uppercase tracking-wider
th/td   : px-6 py-3 (th) / px-6 py-4 (td)
tr      : border-t border-slate-100 hover:bg-slate-50 transition-colors
```

### Form Input

```
Label  : block text-sm font-medium text-slate-700 mb-1.5
Input  : w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900
         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
         placeholder:text-slate-400
Error  : border-red-400 focus:ring-red-500
Error msg : text-xs text-red-500 mt-1
```

### Modal / Dialog

```
Backdrop : fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4
Modal    : bg-white rounded-2xl shadow-xl w-full max-w-md p-6
Header   : flex items-center justify-between mb-4
Footer   : flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100
```

### Empty State

```
┌──────────────────────────────┐
│         [Icon besar]         │
│   Belum ada data             │
│   Klik tombol di atas untuk  │
│   menambahkan yang pertama.  │
│   [+ Tambah Baru]            │
└──────────────────────────────┘
```
Class: `flex flex-col items-center justify-center py-16 text-center`

### Loading Skeleton

Gunakan skeleton pulse untuk state loading, bukan spinner di tengah halaman.
```
<div class="animate-pulse bg-slate-200 rounded-lg h-4 w-3/4" />
```

### Toast / Notification

Posisi: **bottom-right**, muncul setelah server action selesai.
```
Success : bg-white border-l-4 border-emerald-500 shadow-lg rounded-lg p-4
Error   : bg-white border-l-4 border-red-500 shadow-lg rounded-lg p-4
```
Gunakan library toast (rekomendasi: `sonner`) — integrasikan di root layout.

---

## Responsive Breakpoints

```
Mobile   : default (< 768px)   → sidebar hidden, topbar hamburger
Tablet   : md (768px+)         → sidebar overlay toggle
Desktop  : lg (1024px+)        → sidebar selalu visible (fixed)
```

Pola responsive pada grid konten:
```
1 kolom  : grid-cols-1           (mobile)
2 kolom  : md:grid-cols-2        (tablet)
3 kolom  : lg:grid-cols-3        (desktop)
4 kolom  : xl:grid-cols-4        (large desktop)
```

---

## Halaman per Feature

### Login
- Centered card, lebar max-w-sm
- Logo + nama app di atas form
- Field: Username/Email, Password, tombol Login
- Tidak ada sidebar/topbar

### Dashboard (tiap role)
- Grid stat cards (jumlah kelas, materi, tugas pending, dll.)
- List aktivitas terbaru

### Kelola [Entity] (Guru / Admin)
- Page header + tombol "Tambah [Entity]"
- Data table dengan search
- Modal untuk tambah/edit
- Konfirmasi dialog untuk hapus

### Akses Materi (Siswa)
- Grid card materi per kelas
- Card: thumbnail/icon, judul, nama guru, tombol "Buka"
- Halaman detail materi: konten full-width, tombol kembali

### Kerjakan Latihan / Tugas (Siswa)
- Header: judul + deadline badge
- Daftar soal bernomor (latihan) atau deskripsi + upload (tugas)
- Footer sticky: tombol Submit, progress indicator

### Lihat Nilai (Siswa)
- Tabel nilai per mata pelajaran/latihan/tugas
- Badge warna sesuai nilai (merah < 60, kuning 60-79, hijau ≥ 80)

---

## Dos and Don'ts

**Do:**
- Selalu gunakan `rounded-lg` atau `rounded-xl` — tidak ada sudut tajam
- Gunakan `shadow-sm` untuk card, `shadow-lg` untuk modal
- Setiap aksi destruktif (hapus) wajib konfirmasi dialog
- Tabel di mobile: horizontal scroll (`overflow-x-auto`)

**Don't:**
- Jangan pakai lebih dari 2 font weight dalam 1 komponen
- Jangan hard-code warna di luar palette ini
- Jangan tampilkan data kosong tanpa empty state
- Jangan centang loading state dengan `disabled` saja — disable + opacity-50 + cursor-not-allowed

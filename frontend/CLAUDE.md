# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **CRITICAL:** This project uses Next.js 16 with React 19. APIs, conventions, and file structure may differ from training data. Read `node_modules/next/dist/docs/` before writing any Next.js-specific code. Heed deprecation notices.

> **WAJIB — Cek Backend Sebelum Implementasi:** Sebelum menulis types, services, atau UI untuk feature apapun, baca `C:\Alex-sistem\E-Learning-app\backend\docs\MODELS.md` dan `C:\Alex-sistem\E-Learning-app\backend\docs\TASKS.md`. Pastikan kontrak API dan endpoint yang dibutuhkan sudah terdefinisi dan diimplementasi di backend sebelum mulai frontend.

## Commands

```bash
npm run dev      # start dev server (localhost:3000)
npm run build    # production build
npm run lint     # eslint check
npm start        # start production server
```

## Architecture

### Feature-Based Structure

Code is organized by domain feature, not by file type. Each feature is self-contained.

```
src/
├── app/                        # Next.js App Router (routing only)
│   ├── (auth)/                 # route groups
│   ├── dashboard/
│   └── layout.tsx
├── features/                   # domain features
│   └── [feature-name]/
│       ├── actions/            # server actions (mutations only, contains business logic)
│       ├── services/           # HTTP/API calls only, no business logic
│       ├── components/         # UI components scoped to feature
│       ├── hooks/              # client-side hooks
│       ├── stores/             # zustand stores
│       └── types/              # TypeScript types
├── components/                 # shared/global components
├── lib/                        # shared utilities, API clients
└── stores/                     # global zustand stores
```

### Dummy Data (Prototype Phase)

Services return dummy data instead of real HTTP calls. The **type contracts and function signatures must not change** when switching to real API — only the implementation body changes.

Structure per feature:

```
features/materi/
├── services/
│   ├── materi.service.ts        # real impl (swap in later)
│   └── materi.dummy.ts          # dummy data & mock service (used now)
└── types/
    └── materi.types.ts          # shared — used by both dummy and real
```

Types must mirror the expected backend response shape exactly:

```typescript
// features/materi/types/materi.types.ts
export interface Materi {
  id: string;
  judul: string;
  konten: string;
  kelasId: string;
  guruId: string;
  createdAt: string; // ISO 8601
  updatedAt: string;
}
```

Dummy data file exports both fixtures and mock service functions with the same signature as the real service:

```typescript
// features/materi/services/materi.dummy.ts
import type { Materi } from "../types/materi.types";

export const DUMMY_MATERI: Materi[] = [
  {
    id: "m-001",
    judul: "Pengenalan Aljabar",
    konten: "...",
    kelasId: "k-001",
    guruId: "g-001",
    createdAt: "2026-01-10T08:00:00.000Z",
    updatedAt: "2026-01-10T08:00:00.000Z",
  },
];

export async function fetchMateriList(): Promise<Materi[]> {
  return DUMMY_MATERI;
}

export async function fetchMateriById(id: string): Promise<Materi | null> {
  return DUMMY_MATERI.find((m) => m.id === id) ?? null;
}
```

The real service file has the same exports — when ready, swap the import in `actions/` and `page.tsx` from `.dummy` to `.service`.

**ID convention for dummy data:** prefix by entity initial + 3-digit number (`m-001`, `k-001`, `g-001`, `s-001`).

### Service Layer

All HTTP/API calls go through a service file. Services are plain async functions — no business logic, just fetching.

```typescript
// features/materi/services/materi.service.ts
export async function fetchMateriList(): Promise<Materi[]> {
  const res = await fetch(`${process.env.API_URL}/materi`);
  if (!res.ok) throw new Error("Failed to fetch materi");
  return res.json();
}
```

### Data Fetching Rules

**GET (read):** Server pages call the service directly. Never fetch in client components.

```tsx
// app/materi/page.tsx — server component (default)
import { fetchMateriList } from "@/features/materi/services/materi.service";

export default async function MateriPage() {
  const materi = await fetchMateriList();
  return <MateriList materi={materi} />;
}
```

**Mutations:** Business logic lives in server actions. Server actions call services for HTTP, then apply logic on the result.

```tsx
// features/materi/actions/create-materi.ts
"use server";
import { createMateriRequest } from "@/features/materi/services/materi.service";

export async function createMateri(data: MateriInput): Promise<ActionResponse<Materi>> {
  // business logic here (validation, auth check, transforms)
  const result = await createMateriRequest(data);
  return { success: true, data: result };
}
```

### Response Shape (Consistent for All Actions)

All server actions must return this shape — no exceptions:

```typescript
type ActionResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
```

Usage in client:

```typescript
const result = await createCourse(formData);
if (!result.success) {
  // handle result.error
} else {
  // use result.data
}
```

### State Management (Zustand)

Client state lives in Zustand stores. Server-fetched data is not duplicated in Zustand — it's passed as props from server components.

Zustand is used for:
- UI state (modals, sidebar open/closed, active tabs)
- Client-only transient state
- Cross-component communication without prop drilling

```typescript
// features/courses/stores/course-ui.store.ts
import { create } from "zustand";

interface CourseUIStore {
  selectedCourseId: string | null;
  setSelectedCourse: (id: string | null) => void;
}

export const useCourseUIStore = create<CourseUIStore>((set) => ({
  selectedCourseId: null,
  setSelectedCourse: (id) => set({ selectedCourseId: id }),
}));
```

## Task Tracking (WAJIB)

Task planning ada di [`docs/TASKS.md`](docs/TASKS.md).

**Aturan auto-mark:**
- Setiap kali 1 task selesai diimplementasi → langsung edit `docs/TASKS.md`, ubah `- [ ]` → `- [x]` pada task tersebut
- Tandai **sebelum** lanjut ke task berikutnya — jangan batch di akhir
- Jika task ternyata membutuhkan sub-task baru yang belum ada → tambahkan dulu ke `docs/TASKS.md`, baru kerjakan

## Design Reference

Sebelum implementasi komponen atau halaman apapun, baca [`docs/DESIGN.md`](docs/DESIGN.md). File itu berisi: color palette, typography, spacing, layout shell, sidebar per role, pola komponen (card, button, table, modal, form, toast, skeleton, empty state), breakpoint responsive, dan layout tiap halaman feature.

## Domain Features (Use Case)

Actors: **Administrator**, **Guru** (Teacher), **Siswa** (Student).

| Feature | Folder | Actors |
|---|---|---|
| Auth (login, logout) | `features/auth` | All |
| Kelola Akun | `features/akun` | Administrator |
| Kelola Kelas | `features/kelas` | Administrator |
| Kelola Materi | `features/materi` | Guru |
| Akses Materi | `features/materi` | Siswa |
| Kelola Latihan | `features/latihan` | Guru |
| Kerjakan Latihan | `features/latihan` | Siswa |
| Kelola Tugas | `features/tugas` | Guru |
| Kerjakan Tugas | `features/tugas` | Siswa |
| Kelola Nilai | `features/nilai` | Guru |
| Lihat Nilai | `features/nilai` | Siswa |

Shared use cases (login/logout) go in `features/auth`. Per-actor views in same feature folder, split by component/action file, not by actor subfolder.

## Key Config

- Path alias `@/*` → `src/*` (use `@/features/...` not relative paths)
- Tailwind v4 via PostCSS (`@tailwindcss/postcss`) — no `tailwind.config.js`
- React Compiler enabled (`reactCompiler: true` in `next.config.ts`) — do not manually memoize with `useMemo`/`useCallback` unless React Compiler cannot handle it
- TypeScript strict mode on

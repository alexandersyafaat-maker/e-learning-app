# Nilai Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Kelola Nilai for Guru (input nilai latihan & tugas per siswa) and Nilai Saya for Siswa (view own nilai + download PDF).

**Architecture:** Nilai has no separate entity — it lives as a `nilai?: number` field inside `HasilLatihan` and `SubmisiTugas`. Frontend fetches those records grouped by guru/siswa, guru updates nilai via two PATCH server actions. Siswa downloads via `window.print()` + print CSS (no extra library). Follows existing feature pattern: `types → services (dummy+real) → actions → store → components → page`.

**Tech Stack:** Next.js 16, React 19, Zustand 5, Tailwind v4, Lucide React, Sonner (toast), TypeScript strict.

## Global Constraints

- Path alias `@/*` → `src/*` — always use alias, never relative `../../`
- No manual `useMemo`/`useCallback` — React Compiler handles memoization
- Server pages fetch data directly (no client-side fetch)
- All server actions return `ActionResponse<T>` from `@/lib/types`
- Dummy data uses `u-002`/`u-003` for guru, `u-004`/`u-005`/`u-006` for siswa, `k-001`–`k-004` for kelas
- Tailwind v4 — no `tailwind.config.js`, use utility classes directly
- `revalidatePath` must be called in server actions after mutations
- Toast via `sonner`, wired in root layout already
- `fallbackArray()` from `@/lib/utils` wraps fetch calls that return arrays in server pages
- `getSession()` from `@/lib/session` for auth in server actions/pages

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/features/nilai/types/nilai.types.ts` | Create | All types for this feature |
| `src/features/nilai/services/nilai.dummy.ts` | Create | Dummy data + mock service functions |
| `src/features/nilai/services/nilai.service.ts` | Create | Real service (apiFetch calls) |
| `src/features/nilai/actions/update-hasil-latihan-nilai.action.ts` | Create | Server action: PATCH nilai on HasilLatihan |
| `src/features/nilai/actions/update-submisi-tugas-nilai.action.ts` | Create | Server action: PATCH nilai on SubmisiTugas |
| `src/features/nilai/stores/nilai-ui.store.ts` | Create | Zustand: activeTab + modal state |
| `src/features/nilai/components/NilaiBadge.tsx` | Create | Color-coded nilai badge (shared) |
| `src/features/nilai/components/NilaiBeriModal.tsx` | Create | Guru modal to input/edit nilai |
| `src/features/nilai/components/NilaiTable.tsx` | Create | Guru tabbed table (Latihan / Tugas) |
| `src/features/nilai/components/NilaiPrintView.tsx` | Create | Print-only layout for siswa PDF |
| `src/features/nilai/components/NilaiSiswaTable.tsx` | Create | Siswa view: two-section table + download |
| `src/app/(dashboard)/guru/nilai/page.tsx` | Modify | Guru page — fetch + render |
| `src/app/(dashboard)/siswa/nilai/page.tsx` | Modify | Siswa page — fetch + render |

---

## Task 1: Types

**Files:**
- Create: `src/features/nilai/types/nilai.types.ts`

**Interfaces:**
- Produces: `HasilLatihanNilai`, `SubmisiTugasNilai`, `NilaiSiswa`, `UpdateNilaiInput` — used by all subsequent tasks

- [ ] **Step 1: Create types file**

```typescript
// src/features/nilai/types/nilai.types.ts
import type { BaseEntity } from "@/lib/types";

export interface HasilLatihanNilai extends BaseEntity {
  latihanId: string;
  latihanJudul: string;
  siswaId: string;
  siswaNama: string;
  siswaEmail: string;
  kelasId: string;
  kelasNama: string;
  jawaban: string;
  nilai?: number;
  submittedAt: string;
}

export interface SubmisiTugasNilai extends BaseEntity {
  tugasId: string;
  tugasJudul: string;
  siswaId: string;
  siswaNama: string;
  siswaEmail: string;
  kelasId: string;
  kelasNama: string;
  catatan: string;
  nilai?: number;
  submittedAt: string;
}

export interface NilaiSiswa {
  latihan: HasilLatihanNilai[];
  tugas: SubmisiTugasNilai[];
}

export interface UpdateNilaiInput {
  nilai: number;
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`  
Expected: 0 errors

---

## Task 2: Dummy Service + Real Service Stub

**Files:**
- Create: `src/features/nilai/services/nilai.dummy.ts`
- Create: `src/features/nilai/services/nilai.service.ts`

**Interfaces:**
- Consumes: `HasilLatihanNilai`, `SubmisiTugasNilai`, `NilaiSiswa`, `UpdateNilaiInput` from Task 1
- Produces (functions — same signatures in both files):
  - `fetchHasilLatihanByGuru(guruId: string): Promise<HasilLatihanNilai[]>`
  - `fetchSubmisiTugasByGuru(guruId: string): Promise<SubmisiTugasNilai[]>`
  - `updateHasilLatihanNilaiRequest(latihanId: string, hasilId: string, input: UpdateNilaiInput): Promise<HasilLatihanNilai>`
  - `updateSubmisiTugasNilaiRequest(tugasId: string, submisiId: string, input: UpdateNilaiInput): Promise<SubmisiTugasNilai>`
  - `fetchNilaiSiswa(siswaId: string): Promise<NilaiSiswa>`

- [ ] **Step 1: Create dummy service**

```typescript
// src/features/nilai/services/nilai.dummy.ts
import type {
  HasilLatihanNilai,
  SubmisiTugasNilai,
  NilaiSiswa,
  UpdateNilaiInput,
} from "../types/nilai.types";

const KELAS_NAMA: Record<string, string> = {
  "k-001": "X IPA 1",
  "k-002": "X IPA 2",
  "k-003": "XI IPA 1",
  "k-004": "XII IPS 1",
};

const SISWA_MAP: Record<string, { nama: string; email: string; kelasId: string }> = {
  "u-004": { nama: "Andi Pratama", email: "andi@siswa.com", kelasId: "k-001" },
  "u-005": { nama: "Siti Rahayu", email: "siti@siswa.com", kelasId: "k-001" },
  "u-006": { nama: "Reza Firmansyah", email: "reza@siswa.com", kelasId: "k-002" },
};

let DUMMY_HASIL_LATIHAN: HasilLatihanNilai[] = [
  {
    id: "hl-001",
    latihanId: "lat-001",
    latihanJudul: "Latihan Aljabar Dasar",
    siswaId: "u-004",
    siswaNama: "Andi Pratama",
    siswaEmail: "andi@siswa.com",
    kelasId: "k-001",
    kelasNama: "X IPA 1",
    jawaban: "1. x = 3\n2. y = 3\n3. z = 7\nPenjelasan: menggunakan operasi invers pada kedua ruas.",
    nilai: 85,
    submittedAt: "2026-01-20T10:00:00.000Z",
    createdAt: "2026-01-20T10:00:00.000Z",
    updatedAt: "2026-01-20T10:00:00.000Z",
  },
  {
    id: "hl-002",
    latihanId: "lat-001",
    latihanJudul: "Latihan Aljabar Dasar",
    siswaId: "u-005",
    siswaNama: "Siti Rahayu",
    siswaEmail: "siti@siswa.com",
    kelasId: "k-001",
    kelasNama: "X IPA 1",
    jawaban: "1. x = 3\n2. y = 3 (ragu-ragu)\n3. z = 6 (salah)\nSaya masih bingung soal no 3.",
    nilai: undefined,
    submittedAt: "2026-01-20T11:30:00.000Z",
    createdAt: "2026-01-20T11:30:00.000Z",
    updatedAt: "2026-01-20T11:30:00.000Z",
  },
  {
    id: "hl-003",
    latihanId: "lat-002",
    latihanJudul: "Latihan Fungsi Linear",
    siswaId: "u-004",
    siswaNama: "Andi Pratama",
    siswaEmail: "andi@siswa.com",
    kelasId: "k-001",
    kelasNama: "X IPA 1",
    jawaban: "f(x) = 2x+1, gradien = 2, titik potong y = 1. Grafik naik ke kanan.",
    nilai: 92,
    submittedAt: "2026-02-05T09:00:00.000Z",
    createdAt: "2026-02-05T09:00:00.000Z",
    updatedAt: "2026-02-05T09:00:00.000Z",
  },
  {
    id: "hl-004",
    latihanId: "lat-003",
    latihanJudul: "Latihan Struktur Sel",
    siswaId: "u-006",
    siswaNama: "Reza Firmansyah",
    siswaEmail: "reza@siswa.com",
    kelasId: "k-002",
    kelasNama: "X IPA 2",
    jawaban: "Sel prokariot tidak memiliki membran inti. Sel eukariot memiliki membran inti. Mitokondria = penghasil energi.",
    nilai: 78,
    submittedAt: "2026-01-25T14:00:00.000Z",
    createdAt: "2026-01-25T14:00:00.000Z",
    updatedAt: "2026-01-25T14:00:00.000Z",
  },
];

let DUMMY_SUBMISI_TUGAS: SubmisiTugasNilai[] = [
  {
    id: "st-001",
    tugasId: "tgs-001",
    tugasJudul: "Tugas Persamaan Kuadrat",
    siswaId: "u-004",
    siswaNama: "Andi Pratama",
    siswaEmail: "andi@siswa.com",
    kelasId: "k-001",
    kelasNama: "X IPA 1",
    catatan: "Terlampir di file PDF. Saya menggunakan metode faktorisasi dan rumus ABC.",
    nilai: 90,
    submittedAt: "2026-02-10T08:00:00.000Z",
    createdAt: "2026-02-10T08:00:00.000Z",
    updatedAt: "2026-02-10T08:00:00.000Z",
  },
  {
    id: "st-002",
    tugasId: "tgs-001",
    tugasJudul: "Tugas Persamaan Kuadrat",
    siswaId: "u-005",
    siswaNama: "Siti Rahayu",
    siswaEmail: "siti@siswa.com",
    kelasId: "k-001",
    kelasNama: "X IPA 1",
    catatan: "Saya mengerjakan semua soal tapi soal no 5 tidak yakin.",
    nilai: undefined,
    submittedAt: "2026-02-10T15:00:00.000Z",
    createdAt: "2026-02-10T15:00:00.000Z",
    updatedAt: "2026-02-10T15:00:00.000Z",
  },
  {
    id: "st-003",
    tugasId: "tgs-002",
    tugasJudul: "Tugas Laporan Praktikum Sel",
    siswaId: "u-006",
    siswaNama: "Reza Firmansyah",
    siswaEmail: "reza@siswa.com",
    kelasId: "k-002",
    kelasNama: "X IPA 2",
    catatan: "Laporan observasi sel bawang merah menggunakan mikroskop. Hasil terlampir.",
    nilai: 55,
    submittedAt: "2026-01-28T10:00:00.000Z",
    createdAt: "2026-01-28T10:00:00.000Z",
    updatedAt: "2026-01-28T10:00:00.000Z",
  },
];

const GURU_KELAS_MAP: Record<string, string[]> = {
  "u-002": ["k-001", "k-003"],
  "u-003": ["k-002", "k-004"],
};

export async function fetchHasilLatihanByGuru(guruId: string): Promise<HasilLatihanNilai[]> {
  const kelasList = GURU_KELAS_MAP[guruId] ?? [];
  return DUMMY_HASIL_LATIHAN.filter((h) => kelasList.includes(h.kelasId));
}

export async function fetchSubmisiTugasByGuru(guruId: string): Promise<SubmisiTugasNilai[]> {
  const kelasList = GURU_KELAS_MAP[guruId] ?? [];
  return DUMMY_SUBMISI_TUGAS.filter((s) => kelasList.includes(s.kelasId));
}

export async function updateHasilLatihanNilaiRequest(
  _latihanId: string,
  hasilId: string,
  input: UpdateNilaiInput
): Promise<HasilLatihanNilai> {
  const idx = DUMMY_HASIL_LATIHAN.findIndex((h) => h.id === hasilId);
  if (idx === -1) throw new Error("Hasil latihan tidak ditemukan.");
  DUMMY_HASIL_LATIHAN[idx] = {
    ...DUMMY_HASIL_LATIHAN[idx],
    nilai: input.nilai,
    updatedAt: new Date().toISOString(),
  };
  return DUMMY_HASIL_LATIHAN[idx];
}

export async function updateSubmisiTugasNilaiRequest(
  _tugasId: string,
  submisiId: string,
  input: UpdateNilaiInput
): Promise<SubmisiTugasNilai> {
  const idx = DUMMY_SUBMISI_TUGAS.findIndex((s) => s.id === submisiId);
  if (idx === -1) throw new Error("Submisi tugas tidak ditemukan.");
  DUMMY_SUBMISI_TUGAS[idx] = {
    ...DUMMY_SUBMISI_TUGAS[idx],
    nilai: input.nilai,
    updatedAt: new Date().toISOString(),
  };
  return DUMMY_SUBMISI_TUGAS[idx];
}

export async function fetchNilaiSiswa(siswaId: string): Promise<NilaiSiswa> {
  return {
    latihan: DUMMY_HASIL_LATIHAN.filter((h) => h.siswaId === siswaId),
    tugas: DUMMY_SUBMISI_TUGAS.filter((s) => s.siswaId === siswaId),
  };
}
```

- [ ] **Step 2: Create real service stub**

```typescript
// src/features/nilai/services/nilai.service.ts
import { apiFetch } from "@/lib/api";
import type {
  HasilLatihanNilai,
  SubmisiTugasNilai,
  NilaiSiswa,
  UpdateNilaiInput,
} from "../types/nilai.types";

export async function fetchHasilLatihanByGuru(guruId: string): Promise<HasilLatihanNilai[]> {
  return apiFetch<HasilLatihanNilai[]>(`/latihan/hasil?guruId=${guruId}`);
}

export async function fetchSubmisiTugasByGuru(guruId: string): Promise<SubmisiTugasNilai[]> {
  return apiFetch<SubmisiTugasNilai[]>(`/tugas/submisi?guruId=${guruId}`);
}

export async function updateHasilLatihanNilaiRequest(
  latihanId: string,
  hasilId: string,
  input: UpdateNilaiInput
): Promise<HasilLatihanNilai> {
  return apiFetch<HasilLatihanNilai>(
    `/latihan/${latihanId}/hasil/${hasilId}/nilai`,
    { method: "PATCH", body: JSON.stringify(input) }
  );
}

export async function updateSubmisiTugasNilaiRequest(
  tugasId: string,
  submisiId: string,
  input: UpdateNilaiInput
): Promise<SubmisiTugasNilai> {
  return apiFetch<SubmisiTugasNilai>(
    `/tugas/${tugasId}/submisi/${submisiId}/nilai`,
    { method: "PATCH", body: JSON.stringify(input) }
  );
}

export async function fetchNilaiSiswa(siswaId: string): Promise<NilaiSiswa> {
  return apiFetch<NilaiSiswa>(`/nilai?siswaId=${siswaId}`);
}
```

- [ ] **Step 3: Verify TypeScript**

Run: `npx tsc --noEmit`  
Expected: 0 errors

---

## Task 3: Server Actions

**Files:**
- Create: `src/features/nilai/actions/update-hasil-latihan-nilai.action.ts`
- Create: `src/features/nilai/actions/update-submisi-tugas-nilai.action.ts`

**Interfaces:**
- Consumes: `updateHasilLatihanNilaiRequest`, `updateSubmisiTugasNilaiRequest` from dummy service; `HasilLatihanNilai`, `SubmisiTugasNilai`, `UpdateNilaiInput` from Task 1
- Produces:
  - `updateHasilLatihanNilaiAction(latihanId, hasilId, data): Promise<ActionResponse<HasilLatihanNilai>>`
  - `updateSubmisiTugasNilaiAction(tugasId, submisiId, data): Promise<ActionResponse<SubmisiTugasNilai>>`

- [ ] **Step 1: Create action for latihan nilai**

```typescript
// src/features/nilai/actions/update-hasil-latihan-nilai.action.ts
"use server";

import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/lib/types";
import { getSession } from "@/lib/session";
import type { HasilLatihanNilai, UpdateNilaiInput } from "../types/nilai.types";
import { updateHasilLatihanNilaiRequest } from "../services/nilai.dummy";

export async function updateHasilLatihanNilaiAction(
  latihanId: string,
  hasilId: string,
  data: UpdateNilaiInput
): Promise<ActionResponse<HasilLatihanNilai>> {
  const session = await getSession();
  if (!session) return { success: false, error: "Sesi tidak valid." };
  if (session.role !== "GURU") return { success: false, error: "Akses ditolak." };

  if (data.nilai < 0 || data.nilai > 100 || !Number.isInteger(data.nilai)) {
    return { success: false, error: "Nilai harus bilangan bulat antara 0–100." };
  }

  try {
    const result = await updateHasilLatihanNilaiRequest(latihanId, hasilId, data);
    revalidatePath("/guru/nilai");
    return { success: true, data: result };
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e;
    return { success: false, error: e instanceof Error ? e.message : "Terjadi kesalahan." };
  }
}
```

- [ ] **Step 2: Create action for tugas nilai**

```typescript
// src/features/nilai/actions/update-submisi-tugas-nilai.action.ts
"use server";

import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/lib/types";
import { getSession } from "@/lib/session";
import type { SubmisiTugasNilai, UpdateNilaiInput } from "../types/nilai.types";
import { updateSubmisiTugasNilaiRequest } from "../services/nilai.dummy";

export async function updateSubmisiTugasNilaiAction(
  tugasId: string,
  submisiId: string,
  data: UpdateNilaiInput
): Promise<ActionResponse<SubmisiTugasNilai>> {
  const session = await getSession();
  if (!session) return { success: false, error: "Sesi tidak valid." };
  if (session.role !== "GURU") return { success: false, error: "Akses ditolak." };

  if (data.nilai < 0 || data.nilai > 100 || !Number.isInteger(data.nilai)) {
    return { success: false, error: "Nilai harus bilangan bulat antara 0–100." };
  }

  try {
    const result = await updateSubmisiTugasNilaiRequest(tugasId, submisiId, data);
    revalidatePath("/guru/nilai");
    return { success: true, data: result };
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e;
    return { success: false, error: e instanceof Error ? e.message : "Terjadi kesalahan." };
  }
}
```

- [ ] **Step 3: Verify TypeScript**

Run: `npx tsc --noEmit`  
Expected: 0 errors

---

## Task 4: Zustand Store

**Files:**
- Create: `src/features/nilai/stores/nilai-ui.store.ts`

**Interfaces:**
- Consumes: `HasilLatihanNilai`, `SubmisiTugasNilai` from Task 1
- Produces: `useNilaiUIStore` hook with `activeTab`, `setActiveTab`, `modalTarget`, `openModal`, `closeModal`

- [ ] **Step 1: Create store**

```typescript
// src/features/nilai/stores/nilai-ui.store.ts
"use client";

import { create } from "zustand";
import type { HasilLatihanNilai, SubmisiTugasNilai } from "../types/nilai.types";

type ModalTarget =
  | { type: "latihan"; item: HasilLatihanNilai }
  | { type: "tugas"; item: SubmisiTugasNilai }
  | null;

interface NilaiUIStore {
  activeTab: "latihan" | "tugas";
  setActiveTab: (tab: "latihan" | "tugas") => void;
  modalTarget: ModalTarget;
  openModal: (target: NonNullable<ModalTarget>) => void;
  closeModal: () => void;
}

export const useNilaiUIStore = create<NilaiUIStore>((set) => ({
  activeTab: "latihan",
  setActiveTab: (tab) => set({ activeTab: tab }),
  modalTarget: null,
  openModal: (target) => set({ modalTarget: target }),
  closeModal: () => set({ modalTarget: null }),
}));
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`  
Expected: 0 errors

---

## Task 5: NilaiBadge Component

**Files:**
- Create: `src/features/nilai/components/NilaiBadge.tsx`

**Interfaces:**
- Consumes: `cn` from `@/lib/utils`
- Produces: `<NilaiBadge nilai={number | undefined} />` — colored badge

- [ ] **Step 1: Create component**

```tsx
// src/features/nilai/components/NilaiBadge.tsx
import { cn } from "@/lib/utils";

interface NilaiBadgeProps {
  nilai?: number;
  className?: string;
}

export function NilaiBadge({ nilai, className }: NilaiBadgeProps) {
  if (nilai === undefined || nilai === null) {
    return (
      <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500", className)}>
        Belum dinilai
      </span>
    );
  }

  const colorClass =
    nilai >= 80
      ? "bg-emerald-100 text-emerald-700"
      : nilai >= 60
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-700";

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", colorClass, className)}>
      {nilai}
    </span>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`  
Expected: 0 errors

---

## Task 6: NilaiBeriModal Component (Guru)

**Files:**
- Create: `src/features/nilai/components/NilaiBeriModal.tsx`

**Interfaces:**
- Consumes:
  - `useNilaiUIStore` from Task 4
  - `updateHasilLatihanNilaiAction` from Task 3
  - `updateSubmisiTugasNilaiAction` from Task 3
  - `useActionFeedback` from `@/hooks/useActionFeedback`
  - `FormError` from `@/components/ui/FormError`
  - `HasilLatihanNilai`, `SubmisiTugasNilai`, `UpdateNilaiInput` from Task 1
- Produces: `<NilaiBeriModal />` — modal rendered at page level

Note: This modal uses direct `useState` + `onClick` (not `useActionState`) because the action takes structured args, not `FormData`. The action is called directly in an async handler.

- [ ] **Step 1: Create component**

```tsx
// src/features/nilai/components/NilaiBeriModal.tsx
"use client";

import { useState } from "react";
import { X, FileText } from "lucide-react";
import { toast } from "sonner";
import { useNilaiUIStore } from "../stores/nilai-ui.store";
import { updateHasilLatihanNilaiAction } from "../actions/update-hasil-latihan-nilai.action";
import { updateSubmisiTugasNilaiAction } from "../actions/update-submisi-tugas-nilai.action";
import { FormError } from "@/components/ui/FormError";
import { formatDateShort } from "@/lib/utils";

export function NilaiBeriModal() {
  const { modalTarget, closeModal } = useNilaiUIStore();
  const [nilaiInput, setNilaiInput] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | undefined>();

  if (!modalTarget) return null;

  const { type, item } = modalTarget;
  const judul = type === "latihan" ? item.latihanJudul : item.tugasJudul;
  const isiJawaban = type === "latihan" ? item.jawaban : item.catatan;
  const existingNilai = item.nilai;

  function handleOpen() {
    setNilaiInput(existingNilai !== undefined ? String(existingNilai) : "");
    setError(undefined);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseInt(nilaiInput, 10);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      setError("Nilai harus bilangan bulat antara 0–100.");
      return;
    }
    setIsPending(true);
    setError(undefined);

    let result;
    if (type === "latihan") {
      result = await updateHasilLatihanNilaiAction(item.latihanId, item.id, { nilai: parsed });
    } else {
      result = await updateSubmisiTugasNilaiAction(item.tugasId, item.id, { nilai: parsed });
    }

    setIsPending(false);
    if (!result.success) {
      setError(result.error);
    } else {
      toast.success("Nilai berhasil disimpan.");
      closeModal();
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" ref={() => handleOpen()}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {existingNilai !== undefined ? "Ubah Nilai" : "Beri Nilai"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{item.siswaNama}</p>
          </div>
          <button
            type="button"
            onClick={closeModal}
            disabled={isPending}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {type === "latihan" ? "Latihan" : "Tugas"}
            </p>
            <p className="text-sm font-medium text-slate-800">{judul}</p>
            <p className="text-xs text-slate-400">
              Dikumpulkan: {formatDateShort(item.submittedAt)}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <FileText size={13} className="text-slate-400" />
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {type === "latihan" ? "Jawaban Siswa" : "Catatan Siswa"}
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg border border-slate-200 px-3.5 py-3 max-h-36 overflow-y-auto">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{isiJawaban}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Nilai <span className="text-slate-400 font-normal">(0–100)</span>
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                required
                value={nilaiInput}
                onChange={(e) => setNilaiInput(e.target.value)}
                disabled={isPending}
                placeholder="Contoh: 85"
                className="w-32 px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
              />
            </div>

            <FormError error={error} />

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={closeModal}
                disabled={isPending}
                className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "Menyimpan..." : "Simpan Nilai"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`  
Expected: 0 errors

---

## Task 7: NilaiTable Component (Guru)

**Files:**
- Create: `src/features/nilai/components/NilaiTable.tsx`

**Interfaces:**
- Consumes:
  - `useNilaiUIStore` from Task 4
  - `NilaiBadge` from Task 5
  - `EmptyState` from `@/components/ui/EmptyState`
  - `HasilLatihanNilai`, `SubmisiTugasNilai` from Task 1
  - `formatDateShort` from `@/lib/utils`
- Produces: `<NilaiTable hasilLatihan={...} submisiTugas={...} />`

- [ ] **Step 1: Create component**

```tsx
// src/features/nilai/components/NilaiTable.tsx
"use client";

import { useState } from "react";
import { Search, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { NilaiBadge } from "./NilaiBadge";
import { useNilaiUIStore } from "../stores/nilai-ui.store";
import type { HasilLatihanNilai, SubmisiTugasNilai } from "../types/nilai.types";
import { formatDateShort } from "@/lib/utils";

interface NilaiTableProps {
  hasilLatihan: HasilLatihanNilai[];
  submisiTugas: SubmisiTugasNilai[];
}

function LatihanTab({ data }: { data: HasilLatihanNilai[] }) {
  const [search, setSearch] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
  const { openModal } = useNilaiUIStore();

  const kelasList = Array.from(new Set(data.map((d) => d.kelasNama))).sort();

  const filtered = data.filter((d) => {
    const matchSearch =
      d.siswaNama.toLowerCase().includes(search.toLowerCase()) ||
      d.latihanJudul.toLowerCase().includes(search.toLowerCase());
    const matchKelas = !filterKelas || d.kelasNama === filterKelas;
    return matchSearch && matchKelas;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama siswa atau judul latihan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        {kelasList.length > 1 && (
          <select
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
            className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          >
            <option value="">Semua Kelas</option>
            {kelasList.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {filtered.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Tidak ada data"
            description="Belum ada siswa yang mengumpulkan latihan."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-10">No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama Siswa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Judul Latihan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kelas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tgl Kumpul</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nilai</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item, i) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-500">{i + 1}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{item.siswaNama}</div>
                      <div className="text-xs text-slate-400">{item.siswaEmail}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{item.latihanJudul}</td>
                    <td className="px-6 py-4">
                      <Badge variant="indigo">{item.kelasNama}</Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{formatDateShort(item.submittedAt)}</td>
                    <td className="px-6 py-4">
                      <NilaiBadge nilai={item.nilai} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => openModal({ type: "latihan", item })}
                        className="text-xs px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium transition-colors"
                      >
                        {item.nilai !== undefined ? "Ubah Nilai" : "Beri Nilai"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="text-xs text-slate-400">Menampilkan {filtered.length} dari {data.length} submisi</p>
    </div>
  );
}

function TugasTab({ data }: { data: SubmisiTugasNilai[] }) {
  const [search, setSearch] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
  const { openModal } = useNilaiUIStore();

  const kelasList = Array.from(new Set(data.map((d) => d.kelasNama))).sort();

  const filtered = data.filter((d) => {
    const matchSearch =
      d.siswaNama.toLowerCase().includes(search.toLowerCase()) ||
      d.tugasJudul.toLowerCase().includes(search.toLowerCase());
    const matchKelas = !filterKelas || d.kelasNama === filterKelas;
    return matchSearch && matchKelas;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama siswa atau judul tugas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        {kelasList.length > 1 && (
          <select
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
            className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          >
            <option value="">Semua Kelas</option>
            {kelasList.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {filtered.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Tidak ada data"
            description="Belum ada siswa yang mengumpulkan tugas."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-10">No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama Siswa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Judul Tugas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kelas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tgl Kumpul</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nilai</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item, i) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-500">{i + 1}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{item.siswaNama}</div>
                      <div className="text-xs text-slate-400">{item.siswaEmail}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{item.tugasJudul}</td>
                    <td className="px-6 py-4">
                      <Badge variant="indigo">{item.kelasNama}</Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{formatDateShort(item.submittedAt)}</td>
                    <td className="px-6 py-4">
                      <NilaiBadge nilai={item.nilai} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => openModal({ type: "tugas", item })}
                        className="text-xs px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium transition-colors"
                      >
                        {item.nilai !== undefined ? "Ubah Nilai" : "Beri Nilai"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="text-xs text-slate-400">Menampilkan {filtered.length} dari {data.length} submisi</p>
    </div>
  );
}

export function NilaiTable({ hasilLatihan, submisiTugas }: NilaiTableProps) {
  const { activeTab, setActiveTab } = useNilaiUIStore();

  return (
    <div>
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("latihan")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "latihan"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Nilai Latihan
          <span className="ml-2 text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">
            {hasilLatihan.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("tugas")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "tugas"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Nilai Tugas
          <span className="ml-2 text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">
            {submisiTugas.length}
          </span>
        </button>
      </div>

      {activeTab === "latihan" ? (
        <LatihanTab data={hasilLatihan} />
      ) : (
        <TugasTab data={submisiTugas} />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`  
Expected: 0 errors

---

## Task 8: Guru Page

**Files:**
- Modify: `src/app/(dashboard)/guru/nilai/page.tsx`

**Interfaces:**
- Consumes:
  - `fetchHasilLatihanByGuru`, `fetchSubmisiTugasByGuru` from dummy service (Task 2)
  - `NilaiTable` from Task 7
  - `NilaiBeriModal` from Task 6
  - `fallbackArray` from `@/lib/utils`
  - `getSession` from `@/lib/session`

- [ ] **Step 1: Replace placeholder page**

```tsx
// src/app/(dashboard)/guru/nilai/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { fallbackArray } from "@/lib/utils";
import { fetchHasilLatihanByGuru, fetchSubmisiTugasByGuru } from "@/features/nilai/services/nilai.dummy";
import { NilaiTable } from "@/features/nilai/components/NilaiTable";
import { NilaiBeriModal } from "@/features/nilai/components/NilaiBeriModal";

export const metadata: Metadata = { title: "Kelola Nilai" };

export default async function GuruNilaiPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [hasilLatihan, submisiTugas] = await Promise.all([
    fallbackArray(fetchHasilLatihanByGuru(session.userId)),
    fallbackArray(fetchSubmisiTugasByGuru(session.userId)),
  ]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Kelola Nilai</h1>
        <p className="text-sm text-slate-500 mt-1">
          Beri dan kelola nilai untuk latihan dan tugas yang dikumpulkan siswa.
        </p>
      </div>

      <NilaiTable hasilLatihan={hasilLatihan} submisiTugas={submisiTugas} />
      <NilaiBeriModal />
    </>
  );
}
```

- [ ] **Step 2: Run dev server and verify**

Run: `npm run dev`  
Open: `http://localhost:3000/guru/nilai`  
Verify:
- Login sebagai guru (u-002)
- Halaman tampil dengan 2 tab: "Nilai Latihan" dan "Nilai Tugas"
- Tab Latihan: 3 baris data, 2 sudah dinilai (badge hijau/kuning), 1 belum (badge abu)
- Klik "Beri Nilai" pada item belum dinilai → modal muncul dengan jawaban siswa
- Input nilai 75 → klik Simpan → toast sukses → nilai berubah
- Tab Tugas: 2 baris, 1 sudah dinilai, 1 belum
- Filter kelas bekerja
- Search bekerja

- [ ] **Step 3: Verify TypeScript + lint**

Run: `npx tsc --noEmit && npm run lint`  
Expected: 0 errors

---

## Task 9: NilaiPrintView + NilaiSiswaTable Components

**Files:**
- Create: `src/features/nilai/components/NilaiPrintView.tsx`
- Create: `src/features/nilai/components/NilaiSiswaTable.tsx`

**Interfaces:**
- Consumes: `HasilLatihanNilai`, `SubmisiTugasNilai`, `NilaiSiswa` from Task 1; `NilaiBadge` from Task 5; `formatDateShort` from `@/lib/utils`
- Produces:
  - `<NilaiPrintView data={NilaiSiswa} namaSiswa={string} />` — print-only layout
  - `<NilaiSiswaTable data={NilaiSiswa} namaSiswa={string} />` — full siswa view

- [ ] **Step 1: Create NilaiPrintView**

```tsx
// src/features/nilai/components/NilaiPrintView.tsx
import type { NilaiSiswa } from "../types/nilai.types";
import { formatDateShort } from "@/lib/utils";

interface NilaiPrintViewProps {
  data: NilaiSiswa;
  namaSiswa: string;
}

function avg(values: (number | undefined)[]): string {
  const defined = values.filter((v): v is number => v !== undefined);
  if (defined.length === 0) return "—";
  return (defined.reduce((a, b) => a + b, 0) / defined.length).toFixed(1);
}

export function NilaiPrintView({ data, namaSiswa }: NilaiPrintViewProps) {
  const today = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="hidden print:block p-8 font-sans text-sm text-black">
      <div className="mb-6 border-b-2 border-black pb-4">
        <h1 className="text-xl font-bold">Rekap Nilai</h1>
        <p className="text-sm mt-1">Nama: {namaSiswa}</p>
        <p className="text-sm">Tanggal Cetak: {today}</p>
      </div>

      <div className="mb-6">
        <h2 className="font-bold text-base mb-2">Nilai Latihan</h2>
        {data.latihan.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Belum ada latihan yang dikumpulkan.</p>
        ) : (
          <>
            <table className="w-full border-collapse border border-black text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black px-3 py-1 text-left w-8">No</th>
                  <th className="border border-black px-3 py-1 text-left">Judul Latihan</th>
                  <th className="border border-black px-3 py-1 text-left">Tgl Kumpul</th>
                  <th className="border border-black px-3 py-1 text-center w-16">Nilai</th>
                </tr>
              </thead>
              <tbody>
                {data.latihan.map((item, i) => (
                  <tr key={item.id}>
                    <td className="border border-black px-3 py-1">{i + 1}</td>
                    <td className="border border-black px-3 py-1">{item.latihanJudul}</td>
                    <td className="border border-black px-3 py-1">{formatDateShort(item.submittedAt)}</td>
                    <td className="border border-black px-3 py-1 text-center font-medium">
                      {item.nilai !== undefined ? item.nilai : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs mt-1 text-right">
              Rata-rata: <strong>{avg(data.latihan.map((h) => h.nilai))}</strong>
            </p>
          </>
        )}
      </div>

      <div>
        <h2 className="font-bold text-base mb-2">Nilai Tugas</h2>
        {data.tugas.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Belum ada tugas yang dikumpulkan.</p>
        ) : (
          <>
            <table className="w-full border-collapse border border-black text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black px-3 py-1 text-left w-8">No</th>
                  <th className="border border-black px-3 py-1 text-left">Judul Tugas</th>
                  <th className="border border-black px-3 py-1 text-left">Tgl Kumpul</th>
                  <th className="border border-black px-3 py-1 text-center w-16">Nilai</th>
                </tr>
              </thead>
              <tbody>
                {data.tugas.map((item, i) => (
                  <tr key={item.id}>
                    <td className="border border-black px-3 py-1">{i + 1}</td>
                    <td className="border border-black px-3 py-1">{item.tugasJudul}</td>
                    <td className="border border-black px-3 py-1">{formatDateShort(item.submittedAt)}</td>
                    <td className="border border-black px-3 py-1 text-center font-medium">
                      {item.nilai !== undefined ? item.nilai : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs mt-1 text-right">
              Rata-rata: <strong>{avg(data.tugas.map((s) => s.nilai))}</strong>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create NilaiSiswaTable**

```tsx
// src/features/nilai/components/NilaiSiswaTable.tsx
"use client";

import { Printer, ClipboardList } from "lucide-react";
import { NilaiBadge } from "./NilaiBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import type { NilaiSiswa } from "../types/nilai.types";
import { formatDateShort } from "@/lib/utils";

interface NilaiSiswaTableProps {
  data: NilaiSiswa;
  namaSiswa: string;
}

function avg(values: (number | undefined)[]): string {
  const defined = values.filter((v): v is number => v !== undefined);
  if (defined.length === 0) return "—";
  return (defined.reduce((a, b) => a + b, 0) / defined.length).toFixed(1);
}

export function NilaiSiswaTable({ data, namaSiswa }: NilaiSiswaTableProps) {
  const rataLatihan = avg(data.latihan.map((h) => h.nilai));
  const rataTugas = avg(data.tugas.map((s) => s.nilai));

  return (
    <div className="space-y-6 print:hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nilai Saya</h1>
          <p className="text-sm text-slate-500 mt-1">Rekap nilai latihan dan tugas Anda.</p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Printer size={15} />
          Download PDF
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">Nilai Latihan</h2>
          {rataLatihan !== "—" && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              Rata-rata:
              <NilaiBadge nilai={parseFloat(rataLatihan)} />
            </div>
          )}
        </div>
        {data.latihan.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Belum ada latihan"
            description="Nilai latihan akan muncul setelah guru memberi penilaian."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-10">No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Judul Latihan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tgl Kumpul</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nilai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.latihan.map((item, i) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-500">{i + 1}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{item.latihanJudul}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{formatDateShort(item.submittedAt)}</td>
                    <td className="px-6 py-4">
                      <NilaiBadge nilai={item.nilai} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">Nilai Tugas</h2>
          {rataTugas !== "—" && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              Rata-rata:
              <NilaiBadge nilai={parseFloat(rataTugas)} />
            </div>
          )}
        </div>
        {data.tugas.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Belum ada tugas"
            description="Nilai tugas akan muncul setelah guru memberi penilaian."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-10">No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Judul Tugas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tgl Kumpul</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nilai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.tugas.map((item, i) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-500">{i + 1}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{item.tugasJudul}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{formatDateShort(item.submittedAt)}</td>
                    <td className="px-6 py-4">
                      <NilaiBadge nilai={item.nilai} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400">
        * "Belum dinilai" = nilai belum dimasukkan guru.
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript**

Run: `npx tsc --noEmit`  
Expected: 0 errors

---

## Task 10: Siswa Page

**Files:**
- Modify: `src/app/(dashboard)/siswa/nilai/page.tsx`

**Interfaces:**
- Consumes:
  - `fetchNilaiSiswa` from dummy service (Task 2)
  - `NilaiSiswaTable` from Task 9
  - `NilaiPrintView` from Task 9
  - `getSession` from `@/lib/session`

- [ ] **Step 1: Replace placeholder page**

```tsx
// src/app/(dashboard)/siswa/nilai/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { fetchNilaiSiswa } from "@/features/nilai/services/nilai.dummy";
import { NilaiSiswaTable } from "@/features/nilai/components/NilaiSiswaTable";
import { NilaiPrintView } from "@/features/nilai/components/NilaiPrintView";

export const metadata: Metadata = { title: "Nilai Saya" };

export default async function SiswaNilaiPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const data = await fetchNilaiSiswa(session.userId).catch(() => ({
    latihan: [],
    tugas: [],
  }));

  return (
    <>
      <NilaiSiswaTable data={data} namaSiswa={session.name} />
      <NilaiPrintView data={data} namaSiswa={session.name} />
    </>
  );
}
```

- [ ] **Step 2: Run dev server and verify**

Run: `npm run dev`  
Open: `http://localhost:3000/siswa/nilai`  
Verify:
- Login sebagai siswa (u-004 = Andi Pratama)
- Halaman tampil dengan 2 section: "Nilai Latihan" dan "Nilai Tugas"
- Latihan: 2 baris (nilai 85 hijau, nilai 92 hijau), rata-rata tampil di header card
- Tugas: 1 baris (nilai 90 hijau), rata-rata tampil
- Klik "Download PDF" → print dialog terbuka, preview menampilkan tabel format print
- Login sebagai siswa u-005 (Siti) → latihan 1 baris belum dinilai, tugas 1 baris belum dinilai

- [ ] **Step 3: Verify TypeScript + lint**

Run: `npx tsc --noEmit && npm run lint`  
Expected: 0 errors

---

## Task 11: Update TASKS.md

**Files:**
- Modify: `docs/TASKS.md`

- [ ] **Step 1: Mark Phase 9 tasks as done**

Ubah semua `- [ ]` di Phase 9 menjadi `- [x]` untuk tasks yang sudah diimplementasi:

```markdown
## Phase 9 — Nilai (Guru + Siswa)

### Types & Data
- [x] Buat `src/features/nilai/types/nilai.types.ts`
- [x] Buat `src/features/nilai/services/nilai.dummy.ts`
- [x] Buat `src/features/nilai/services/nilai.service.ts`

### Actions (Guru)
- [x] Buat `src/features/nilai/actions/update-hasil-latihan-nilai.action.ts`
- [x] Buat `src/features/nilai/actions/update-submisi-tugas-nilai.action.ts`

### UI Guru
- [x] Buat `src/app/(dashboard)/guru/nilai/page.tsx`
- [x] Buat `src/features/nilai/components/NilaiTable.tsx`
- [x] Buat `src/features/nilai/components/NilaiBeriModal.tsx`
- [x] Buat `src/features/nilai/stores/nilai-ui.store.ts`

### UI Siswa
- [x] Buat `src/app/(dashboard)/siswa/nilai/page.tsx`
- [x] Buat `src/features/nilai/components/NilaiBadge.tsx`
- [x] Buat `src/features/nilai/components/NilaiPrintView.tsx`
- [x] Buat `src/features/nilai/components/NilaiSiswaTable.tsx`
```

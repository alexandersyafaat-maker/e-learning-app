# Lampiran Upload Fix — File Visible & Downloadable

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix file upload so lampiran are actually saved to backend and visible/downloadable by guru and siswa after creation.

**Architecture:** Backend needs upload endpoints for latihan/tugas (mirrors materi pattern). Frontend actions replace fake-URL generation with real multipart uploads. Guru gets detail pages for latihan/tugas to view/download lampiran and see siswa submissions.

**Tech Stack:** Next.js 16 (App Router, Server Actions), Express/Node.js backend (Multer), TypeScript, Tailwind v4, Lucide React

## Global Constraints

- Next.js 16, React 19 — no manual memoization
- Tailwind v4 via PostCSS — no tailwind.config.js
- Path alias `@/*` → `src/*`
- All server actions return `ActionResponse<T>` shape
- Follow DESIGN.md: colors, spacing, border-radius (rounded-lg/xl), shadow-sm cards
- Backend API: `http://localhost:8000/api`, static files served at `http://localhost:8000/uploads/`
- Token in httpOnly cookie `token`, session in cookie `session`
- No manual `useMemo`/`useCallback` (React Compiler handles it)

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `backend/src/modules/latihan/latihan.controller.ts` | Modify | Add `uploadLampiranLatihanController` |
| `backend/src/modules/latihan/latihan.routes.ts` | Modify | Add `POST /latihan/upload/lampiran` route |
| `backend/src/modules/tugas/tugas.controller.ts` | Modify | Add `uploadLampiranTugasController` |
| `backend/src/modules/tugas/tugas.routes.ts` | Modify | Add `POST /tugas/upload/lampiran` route |
| `frontend/src/lib/upload.ts` | Create | `uploadLampiranFiles(files, endpoint)` helper |
| `frontend/src/features/materi/actions/create-materi.action.ts` | Modify | Use upload helper |
| `frontend/src/features/materi/actions/update-materi.action.ts` | Modify | Use upload helper |
| `frontend/src/features/latihan/actions/create-latihan.action.ts` | Modify | Use upload helper |
| `frontend/src/features/latihan/actions/update-latihan.action.ts` | Modify | Use upload helper |
| `frontend/src/features/latihan/actions/submit-latihan.action.ts` | Modify | Use upload helper |
| `frontend/src/features/tugas/actions/create-tugas.action.ts` | Modify | Use upload helper |
| `frontend/src/features/tugas/actions/update-tugas.action.ts` | Modify | Use upload helper |
| `frontend/src/features/tugas/actions/submit-tugas.action.ts` | Modify | Use upload helper |
| `frontend/src/app/(dashboard)/guru/latihan/[id]/page.tsx` | Create | Guru detail page: latihan + lampiran + semua hasil siswa |
| `frontend/src/app/(dashboard)/guru/tugas/[id]/page.tsx` | Create | Guru detail page: tugas + lampiran + semua submisi siswa |
| `frontend/src/features/latihan/components/LatihanTable.tsx` | Modify | Add Eye icon link button per row |
| `frontend/src/features/tugas/components/TugasTable.tsx` | Modify | Add Eye icon link button per row |

---

### Task 1: Add upload endpoint to backend — latihan & tugas

**Files:**
- Modify: `C:\Alex-sistem\E-Learning-app\backend\src\modules\latihan\latihan.controller.ts`
- Modify: `C:\Alex-sistem\E-Learning-app\backend\src\modules\latihan\latihan.routes.ts`
- Modify: `C:\Alex-sistem\E-Learning-app\backend\src\modules\tugas\tugas.controller.ts`
- Modify: `C:\Alex-sistem\E-Learning-app\backend\src\modules\tugas\tugas.routes.ts`

**Interfaces:**
- Produces: `POST /api/latihan/upload/lampiran` — accepts `multipart/form-data` with field `file`, returns `{ success: true, data: Lampiran }`
- Produces: `POST /api/tugas/upload/lampiran` — same shape

- [ ] **Step 1: Add uploadLampiranLatihanController to latihan.controller.ts**

Add this import at top of file:
```typescript
import { fileToLampiran } from '@/middlewares/upload.middleware';
```

Add this export at bottom of `latihan.controller.ts`:
```typescript
export const uploadLampiranLatihanController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    sendSuccess(res, null, 400, 'File tidak ditemukan');
    return;
  }
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const lampiran = fileToLampiran(req.file, baseUrl);
  sendCreated(res, lampiran, 'File berhasil diupload');
});
```

- [ ] **Step 2: Register upload route in latihan.routes.ts**

Add import:
```typescript
import { upload } from '@/middlewares/upload.middleware';
import {
  // ...existing imports...
  uploadLampiranLatihanController,
} from '@/modules/latihan/latihan.controller';
```

Add route before `export default router;`:
```typescript
// Upload lampiran — guru only
router.post('/upload/lampiran', requireRole('GURU'), upload.single('file'), uploadLampiranLatihanController);
```

- [ ] **Step 3: Add uploadLampiranTugasController to tugas.controller.ts**

Add import at top:
```typescript
import { fileToLampiran } from '@/middlewares/upload.middleware';
```

Add export at bottom:
```typescript
export const uploadLampiranTugasController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    sendSuccess(res, null, 400, 'File tidak ditemukan');
    return;
  }
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const lampiran = fileToLampiran(req.file, baseUrl);
  sendCreated(res, lampiran, 'File berhasil diupload');
});
```

- [ ] **Step 4: Register upload route in tugas.routes.ts**

Add import:
```typescript
import { upload } from '@/middlewares/upload.middleware';
import {
  // ...existing imports...
  uploadLampiranTugasController,
} from '@/modules/tugas/tugas.controller';
```

Add route before `export default router;`:
```typescript
// Upload lampiran — guru only
router.post('/upload/lampiran', requireRole('GURU'), upload.single('file'), uploadLampiranTugasController);
```

Note for siswa submit (latihan/tugas) — siswa also uploads lampiran. The submit endpoint receives lampiran as JSON (URLs already resolved). For siswa, use the same `/materi/upload/lampiran` endpoint in the frontend upload helper — all endpoints use the same Multer middleware and return the same Lampiran shape. Alternatively, expose a dedicated `/upload/lampiran` route accessible to both GURU and SISWA. The simplest fix: allow the upload endpoint on latihan/tugas for SISWA role too. But since siswa submits to latihan/tugas submit endpoints which accept JSON lampiran, we need siswa to also upload files. So for siswa submit forms, the upload endpoint should allow SISWA role.

Adjust latihan.routes.ts upload route to allow both roles:
```typescript
// Upload lampiran — guru & siswa (untuk submit)
router.post('/upload/lampiran', upload.single('file'), uploadLampiranLatihanController);
```

Same for tugas.routes.ts:
```typescript
router.post('/upload/lampiran', upload.single('file'), uploadLampiranTugasController);
```

(Still requires `authenticate` since `router.use(authenticate)` is at top.)

---

### Task 2: Create frontend upload helper

**Files:**
- Create: `c:\Alex-sistem\E-Learning-app\frontend\src\lib\upload.ts`

**Interfaces:**
- Produces: `uploadLampiranFiles(files: File[], uploadEndpoint: string): Promise<Lampiran[]>`
  - `uploadEndpoint` = full path segment e.g. `"/materi/upload/lampiran"`
  - Returns array of real Lampiran objects from backend
  - Skips files with size 0

- [ ] **Step 1: Create src/lib/upload.ts**

```typescript
import { cookies } from "next/headers";
import type { Lampiran } from "@/lib/types";

const API_URL = process.env.API_URL ?? "http://localhost:8000/api";

interface BackendResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export async function uploadLampiranFiles(
  files: File[],
  uploadEndpoint: string
): Promise<Lampiran[]> {
  const validFiles = files.filter((f) => f instanceof File && f.size > 0);
  if (validFiles.length === 0) return [];

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const results = await Promise.all(
    validFiles.map(async (file) => {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API_URL}${uploadEndpoint}`, {
        method: "POST",
        headers: authHeader,
        body: fd,
      });
      if (!res.ok) {
        throw new Error(`Gagal mengupload file: ${file.name}`);
      }
      const json: BackendResponse<Lampiran> = await res.json();
      if (!json.success) {
        throw new Error(json.error ?? `Upload gagal: ${file.name}`);
      }
      return json.data;
    })
  );

  return results;
}
```

---

### Task 3: Fix create-materi.action.ts

**Files:**
- Modify: `c:\Alex-sistem\E-Learning-app\frontend\src\features\materi\actions\create-materi.action.ts`

**Interfaces:**
- Consumes: `uploadLampiranFiles(files, endpoint)` from `@/lib/upload`

- [ ] **Step 1: Replace fake parseLampiran with real upload**

Replace the entire file content:
```typescript
"use server";

import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/lib/types";
import { getSession } from "@/lib/session";
import type { Materi } from "../types/materi.types";
import { createMateriRequest } from "../services/materi.service";
import { uploadLampiranFiles } from "@/lib/upload";

export async function createMateriAction(
  _prevState: ActionResponse<Materi> | null,
  formData: FormData
): Promise<ActionResponse<Materi>> {
  const session = await getSession();
  if (!session) return { success: false, error: "Sesi tidak valid." };

  const judul = (formData.get("judul") as string)?.trim();
  const konten = (formData.get("konten") as string)?.trim();
  const kelasId = formData.get("kelasId") as string;

  if (!judul || !konten || !kelasId) {
    return { success: false, error: "Semua field wajib diisi." };
  }

  try {
    const files = formData.getAll("lampiran") as File[];
    const lampiran = await uploadLampiranFiles(files, "/materi/upload/lampiran");

    const materi = await createMateriRequest({
      judul,
      konten,
      kelasId,
      guruId: session.userId,
      lampiran,
    });
    revalidatePath("/guru/materi");
    return { success: true, data: materi };
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e;
    return { success: false, error: e instanceof Error ? e.message : "Terjadi kesalahan." };
  }
}
```

---

### Task 4: Fix update-materi.action.ts

**Files:**
- Modify: `c:\Alex-sistem\E-Learning-app\frontend\src\features\materi\actions\update-materi.action.ts`

- [ ] **Step 1: Replace fake parseLampiran with real upload**

Replace the entire file:
```typescript
"use server";

import { revalidatePath } from "next/cache";
import type { ActionResponse, Lampiran } from "@/lib/types";
import type { Materi } from "../types/materi.types";
import { updateMateriRequest } from "../services/materi.service";
import { uploadLampiranFiles } from "@/lib/upload";

export async function updateMateriAction(
  _prevState: ActionResponse<Materi> | null,
  formData: FormData
): Promise<ActionResponse<Materi>> {
  const id = formData.get("id") as string;
  const judul = (formData.get("judul") as string)?.trim();
  const konten = (formData.get("konten") as string)?.trim();
  const kelasId = formData.get("kelasId") as string;

  if (!id || !judul || !konten || !kelasId) {
    return { success: false, error: "Semua field wajib diisi." };
  }

  let keptLampiran: Lampiran[] = [];
  try {
    const raw = formData.get("keptLampiran") as string;
    if (raw) keptLampiran = JSON.parse(raw) as Lampiran[];
  } catch { /* ignore */ }

  try {
    const files = formData.getAll("lampiran") as File[];
    const newLampiran = await uploadLampiranFiles(files, "/materi/upload/lampiran");
    const lampiran = [...keptLampiran, ...newLampiran];

    const materi = await updateMateriRequest(id, { judul, konten, kelasId, lampiran });
    if (!materi) return { success: false, error: "Materi tidak ditemukan." };

    revalidatePath("/guru/materi");
    return { success: true, data: materi };
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e;
    return { success: false, error: e instanceof Error ? e.message : "Terjadi kesalahan." };
  }
}
```

---

### Task 5: Fix create-latihan.action.ts

**Files:**
- Modify: `c:\Alex-sistem\E-Learning-app\frontend\src\features\latihan\actions\create-latihan.action.ts`

- [ ] **Step 1: Replace fake parseLampiran with real upload**

Replace entire file:
```typescript
"use server";

import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/lib/types";
import { getSession } from "@/lib/session";
import type { Latihan } from "../types/latihan.types";
import { createLatihanRequest } from "../services/latihan.service";
import { uploadLampiranFiles } from "@/lib/upload";

export async function createLatihanAction(
  _prev: ActionResponse<Latihan> | null,
  formData: FormData
): Promise<ActionResponse<Latihan>> {
  const session = await getSession();
  if (!session) return { success: false, error: "Sesi tidak valid." };

  const judul = (formData.get("judul") as string)?.trim();
  const deskripsi = (formData.get("deskripsi") as string)?.trim();
  const kelasId = formData.get("kelasId") as string;
  const deadline = (formData.get("deadline") as string) || undefined;

  if (!judul || !deskripsi || !kelasId) {
    return { success: false, error: "Judul, deskripsi, dan kelas wajib diisi." };
  }

  try {
    const files = formData.getAll("lampiran") as File[];
    const lampiran = await uploadLampiranFiles(files, "/latihan/upload/lampiran");

    const latihan = await createLatihanRequest({
      judul,
      deskripsi,
      kelasId,
      guruId: session.userId,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
      lampiran,
    });
    revalidatePath("/guru/latihan");
    return { success: true, data: latihan };
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e;
    return { success: false, error: e instanceof Error ? e.message : "Terjadi kesalahan." };
  }
}
```

---

### Task 6: Fix update-latihan.action.ts

**Files:**
- Modify: `c:\Alex-sistem\E-Learning-app\frontend\src\features\latihan\actions\update-latihan.action.ts`

- [ ] **Step 1: Replace fake parseLampiran with real upload**

Replace entire file:
```typescript
"use server";

import { revalidatePath } from "next/cache";
import type { ActionResponse, Lampiran } from "@/lib/types";
import type { Latihan } from "../types/latihan.types";
import { updateLatihanRequest } from "../services/latihan.service";
import { uploadLampiranFiles } from "@/lib/upload";

export async function updateLatihanAction(
  _prev: ActionResponse<Latihan> | null,
  formData: FormData
): Promise<ActionResponse<Latihan>> {
  const id = formData.get("id") as string;
  const judul = (formData.get("judul") as string)?.trim();
  const deskripsi = (formData.get("deskripsi") as string)?.trim();
  const kelasId = formData.get("kelasId") as string;
  const deadline = (formData.get("deadline") as string) || undefined;

  if (!id || !judul || !deskripsi || !kelasId) {
    return { success: false, error: "Judul, deskripsi, dan kelas wajib diisi." };
  }

  let keptLampiran: Lampiran[] = [];
  try {
    const raw = formData.get("keptLampiran") as string;
    if (raw) keptLampiran = JSON.parse(raw) as Lampiran[];
  } catch { /* ignore */ }

  try {
    const files = formData.getAll("lampiran") as File[];
    const newLampiran = await uploadLampiranFiles(files, "/latihan/upload/lampiran");
    const lampiran = [...keptLampiran, ...newLampiran];

    const latihan = await updateLatihanRequest(id, {
      judul,
      deskripsi,
      kelasId,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
      lampiran,
    });
    if (!latihan) return { success: false, error: "Latihan tidak ditemukan." };

    revalidatePath("/guru/latihan");
    return { success: true, data: latihan };
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e;
    return { success: false, error: e instanceof Error ? e.message : "Terjadi kesalahan." };
  }
}
```

---

### Task 7: Fix submit-latihan.action.ts

**Files:**
- Modify: `c:\Alex-sistem\E-Learning-app\frontend\src\features\latihan\actions\submit-latihan.action.ts`

- [ ] **Step 1: Replace fake URL with real upload**

Replace entire file:
```typescript
"use server";

import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/lib/types";
import { getSession } from "@/lib/session";
import type { HasilLatihan } from "../types/latihan.types";
import { fetchHasilBySiswa, submitLatihanRequest } from "../services/latihan.service";
import { uploadLampiranFiles } from "@/lib/upload";

export async function submitLatihanAction(
  _prev: ActionResponse<HasilLatihan> | null,
  formData: FormData
): Promise<ActionResponse<HasilLatihan>> {
  const session = await getSession();
  if (!session) return { success: false, error: "Sesi tidak valid." };

  const latihanId = formData.get("latihanId") as string;
  const jawaban = (formData.get("jawaban") as string)?.trim();

  if (!latihanId) return { success: false, error: "ID latihan tidak valid." };
  if (!jawaban) return { success: false, error: "Jawaban tidak boleh kosong." };

  try {
    const sudahDikumpulkan = await fetchHasilBySiswa(latihanId, session.userId);
    if (sudahDikumpulkan) return { success: false, error: "Latihan sudah dikumpulkan." };

    const files = formData.getAll("lampiran") as File[];
    const lampiran = await uploadLampiranFiles(files, "/latihan/upload/lampiran");

    const hasil = await submitLatihanRequest({
      latihanId,
      siswaId: session.userId,
      jawaban,
      lampiran,
    });

    revalidatePath("/siswa/latihan");
    revalidatePath(`/siswa/latihan/${latihanId}`);
    return { success: true, data: hasil };
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e;
    return { success: false, error: e instanceof Error ? e.message : "Terjadi kesalahan." };
  }
}
```

---

### Task 8: Fix create-tugas.action.ts

**Files:**
- Modify: `c:\Alex-sistem\E-Learning-app\frontend\src\features\tugas\actions\create-tugas.action.ts`

- [ ] **Step 1: Replace fake parseLampiran with real upload**

Replace entire file:
```typescript
"use server";

import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/lib/types";
import { getSession } from "@/lib/session";
import type { Tugas } from "../types/tugas.types";
import { createTugasRequest } from "../services/tugas.service";
import { uploadLampiranFiles } from "@/lib/upload";

export async function createTugasAction(
  _prev: ActionResponse<Tugas> | null,
  formData: FormData
): Promise<ActionResponse<Tugas>> {
  const session = await getSession();
  if (!session) return { success: false, error: "Sesi tidak valid." };

  const judul = (formData.get("judul") as string)?.trim();
  const deskripsi = (formData.get("deskripsi") as string)?.trim();
  const kelasId = formData.get("kelasId") as string;
  const deadline = (formData.get("deadline") as string) || undefined;

  if (!judul || !deskripsi || !kelasId) {
    return { success: false, error: "Judul, deskripsi, dan kelas wajib diisi." };
  }

  try {
    const files = formData.getAll("lampiran") as File[];
    const lampiran = await uploadLampiranFiles(files, "/tugas/upload/lampiran");

    const tugas = await createTugasRequest({
      judul,
      deskripsi,
      kelasId,
      guruId: session.userId,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
      lampiran,
    });
    revalidatePath("/guru/tugas");
    return { success: true, data: tugas };
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e;
    return { success: false, error: e instanceof Error ? e.message : "Terjadi kesalahan." };
  }
}
```

---

### Task 9: Fix update-tugas.action.ts

**Files:**
- Modify: `c:\Alex-sistem\E-Learning-app\frontend\src\features\tugas\actions\update-tugas.action.ts`

- [ ] **Step 1: Replace fake parseLampiran with real upload**

Replace entire file:
```typescript
"use server";

import { revalidatePath } from "next/cache";
import type { ActionResponse, Lampiran } from "@/lib/types";
import type { Tugas } from "../types/tugas.types";
import { updateTugasRequest } from "../services/tugas.service";
import { uploadLampiranFiles } from "@/lib/upload";

export async function updateTugasAction(
  _prev: ActionResponse<Tugas> | null,
  formData: FormData
): Promise<ActionResponse<Tugas>> {
  const id = formData.get("id") as string;
  const judul = (formData.get("judul") as string)?.trim();
  const deskripsi = (formData.get("deskripsi") as string)?.trim();
  const kelasId = formData.get("kelasId") as string;
  const deadline = (formData.get("deadline") as string) || undefined;

  if (!id || !judul || !deskripsi || !kelasId) {
    return { success: false, error: "Judul, deskripsi, dan kelas wajib diisi." };
  }

  let keptLampiran: Lampiran[] = [];
  try {
    const raw = formData.get("keptLampiran") as string;
    if (raw) keptLampiran = JSON.parse(raw) as Lampiran[];
  } catch { /* ignore */ }

  try {
    const files = formData.getAll("lampiran") as File[];
    const newLampiran = await uploadLampiranFiles(files, "/tugas/upload/lampiran");
    const lampiran = [...keptLampiran, ...newLampiran];

    const tugas = await updateTugasRequest(id, {
      judul,
      deskripsi,
      kelasId,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
      lampiran,
    });
    if (!tugas) return { success: false, error: "Tugas tidak ditemukan." };

    revalidatePath("/guru/tugas");
    return { success: true, data: tugas };
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e;
    return { success: false, error: e instanceof Error ? e.message : "Terjadi kesalahan." };
  }
}
```

---

### Task 10: Fix submit-tugas.action.ts

**Files:**
- Modify: `c:\Alex-sistem\E-Learning-app\frontend\src\features\tugas\actions\submit-tugas.action.ts`

- [ ] **Step 1: Replace fake URL with real upload**

Replace entire file:
```typescript
"use server";

import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/lib/types";
import { getSession } from "@/lib/session";
import type { SubmisiTugas } from "../types/tugas.types";
import { fetchSubmisiBySiswa, submitTugasRequest } from "../services/tugas.service";
import { uploadLampiranFiles } from "@/lib/upload";

export async function submitTugasAction(
  _prev: ActionResponse<SubmisiTugas> | null,
  formData: FormData
): Promise<ActionResponse<SubmisiTugas>> {
  const session = await getSession();
  if (!session) return { success: false, error: "Sesi tidak valid." };

  const tugasId = formData.get("tugasId") as string;
  const catatan = (formData.get("catatan") as string)?.trim() ?? "";

  if (!tugasId) return { success: false, error: "ID tugas tidak valid." };

  const rawFiles = (formData.getAll("lampiran") as File[]).filter(
    (f) => f instanceof File && f.size > 0
  );
  if (rawFiles.length === 0 && !catatan) {
    return { success: false, error: "Lampirkan file atau tuliskan catatan sebelum mengumpulkan." };
  }

  try {
    const sudahDikumpulkan = await fetchSubmisiBySiswa(tugasId, session.userId);
    if (sudahDikumpulkan) return { success: false, error: "Tugas sudah dikumpulkan." };

    const lampiran = await uploadLampiranFiles(rawFiles, "/tugas/upload/lampiran");

    const submisi = await submitTugasRequest({
      tugasId,
      siswaId: session.userId,
      catatan,
      lampiran,
    });

    revalidatePath("/siswa/tugas");
    revalidatePath(`/siswa/tugas/${tugasId}`);
    return { success: true, data: submisi };
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e;
    return { success: false, error: e instanceof Error ? e.message : "Terjadi kesalahan." };
  }
}
```

---

### Task 11: Create guru latihan detail page

**Files:**
- Create: `c:\Alex-sistem\E-Learning-app\frontend\src\app\(dashboard)\guru\latihan\[id]\page.tsx`

**Interfaces:**
- Consumes: `fetchLatihanById(id)` → `LatihanView | null` from `latihan.service`
- Consumes: `fetchSemuaHasil(latihanId)` → `HasilLatihanView[]` from `latihan.service`

- [ ] **Step 1: Create the page**

```typescript
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, ClipboardList, User, GraduationCap, Calendar,
  Paperclip, FileText, Image, Video, File, CheckCircle2,
} from "lucide-react";
import { getSession } from "@/lib/session";
import { fetchLatihanById, fetchSemuaHasil } from "@/features/latihan/services/latihan.service";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import type { Lampiran } from "@/lib/types";
import type { HasilLatihanView } from "@/features/latihan/types/latihan.types";

interface Props { params: Promise<{ id: string }> }

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function LampiranIcon({ tipe }: { tipe: string }) {
  if (tipe.startsWith("image/")) return <Image size={16} className="text-emerald-500" />;
  if (tipe.startsWith("video/")) return <Video size={16} className="text-sky-500" />;
  if (tipe === "application/pdf") return <FileText size={16} className="text-red-500" />;
  return <File size={16} className="text-slate-400" />;
}

function LampiranList({ lampiran, label }: { lampiran: Lampiran[]; label: string }) {
  if (lampiran.length === 0) return null;
  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <Paperclip size={12} /> {label} ({lampiran.length})
      </h3>
      <div className="space-y-2">
        {lampiran.map((lmp) => (
          <div key={lmp.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50">
            <LampiranIcon tipe={lmp.tipe} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-800 font-medium truncate">{lmp.nama}</p>
              <p className="text-xs text-slate-400">{formatBytes(lmp.ukuran)}</p>
            </div>
            <a
              href={lmp.url}
              download={lmp.nama}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium shrink-0 px-3 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors"
            >
              Unduh
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

function HasilSiswaSection({ hasilList }: { hasilList: HasilLatihanView[] }) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-500" />
          Jawaban Siswa
          <span className="text-sm font-normal text-slate-400">({hasilList.length} dikumpulkan)</span>
        </h2>
      </div>
      {hasilList.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-400">Belum ada siswa yang mengumpulkan.</div>
      ) : (
        <div className="divide-y divide-slate-100">
          {hasilList.map((h) => (
            <div key={h.id} className="p-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{h.siswaNama}</p>
                  <p className="text-xs text-slate-400">{h.siswaEmail} · {formatDate(h.submittedAt)}</p>
                </div>
                {h.nilai !== undefined ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
                    Nilai: {h.nilai}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">Belum dinilai</span>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Jawaban</p>
                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 bg-slate-50 rounded-lg p-3 border border-slate-100">
                  {h.jawaban}
                </pre>
              </div>
              <LampiranList lampiran={h.lampiran} label="Lampiran Siswa" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const latihan = await fetchLatihanById(id);
  return { title: latihan ? `Detail — ${latihan.judul}` : "Latihan" };
}

export default async function GuruLatihanDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const [latihan, hasilList] = await Promise.all([
    fetchLatihanById(id),
    fetchSemuaHasil(id).catch(() => []),
  ]);
  if (!latihan) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/guru/latihan" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
        <ChevronLeft size={16} /> Kembali ke Kelola Latihan
      </Link>

      <article className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <ClipboardList size={16} className="text-indigo-600" />
            </div>
            <Badge variant="indigo">{latihan.kelasNama}</Badge>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">{latihan.judul}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><User size={14} />{latihan.guruNama}</span>
            <span className="flex items-center gap-1.5"><GraduationCap size={14} />{latihan.kelasNama}</span>
            {latihan.deadline && (
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                Deadline: {formatDate(latihan.deadline)}
              </span>
            )}
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Soal / Instruksi</h2>
            <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700 bg-slate-50 rounded-xl p-4 border border-slate-100">
              {latihan.deskripsi}
            </pre>
          </div>
          <LampiranList lampiran={latihan.lampiran} label="Lampiran" />
        </div>
      </article>

      <HasilSiswaSection hasilList={hasilList} />
    </div>
  );
}
```

---

### Task 12: Create guru tugas detail page

**Files:**
- Create: `c:\Alex-sistem\E-Learning-app\frontend\src\app\(dashboard)\guru\tugas\[id]\page.tsx`

**Interfaces:**
- Consumes: `fetchTugasById(id)` → `TugasView | null` from `tugas.service`
- Consumes: `fetchSemuaSubmisi(tugasId)` → `SubmisiTugasView[]` from `tugas.service`

- [ ] **Step 1: Create the page**

```typescript
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, BookMarked, User, GraduationCap, Calendar,
  Paperclip, FileText, Image, Video, File, CheckCircle2,
} from "lucide-react";
import { getSession } from "@/lib/session";
import { fetchTugasById, fetchSemuaSubmisi } from "@/features/tugas/services/tugas.service";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import type { Lampiran } from "@/lib/types";
import type { SubmisiTugasView } from "@/features/tugas/types/tugas.types";

interface Props { params: Promise<{ id: string }> }

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function LampiranIcon({ tipe }: { tipe: string }) {
  if (tipe.startsWith("image/")) return <Image size={16} className="text-emerald-500" />;
  if (tipe.startsWith("video/")) return <Video size={16} className="text-sky-500" />;
  if (tipe === "application/pdf") return <FileText size={16} className="text-red-500" />;
  return <File size={16} className="text-slate-400" />;
}

function LampiranList({ lampiran, label }: { lampiran: Lampiran[]; label: string }) {
  if (lampiran.length === 0) return null;
  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <Paperclip size={12} /> {label} ({lampiran.length})
      </h3>
      <div className="space-y-2">
        {lampiran.map((lmp) => (
          <div key={lmp.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50">
            <LampiranIcon tipe={lmp.tipe} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-800 font-medium truncate">{lmp.nama}</p>
              <p className="text-xs text-slate-400">{formatBytes(lmp.ukuran)}</p>
            </div>
            <a
              href={lmp.url}
              download={lmp.nama}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium shrink-0 px-3 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors"
            >
              Unduh
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubmisiSiswaSection({ submisiList }: { submisiList: SubmisiTugasView[] }) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-500" />
          Pengumpulan Siswa
          <span className="text-sm font-normal text-slate-400">({submisiList.length} dikumpulkan)</span>
        </h2>
      </div>
      {submisiList.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-400">Belum ada siswa yang mengumpulkan.</div>
      ) : (
        <div className="divide-y divide-slate-100">
          {submisiList.map((s) => (
            <div key={s.id} className="p-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{s.siswaNama}</p>
                  <p className="text-xs text-slate-400">{s.siswaEmail} · {formatDate(s.submittedAt)}</p>
                </div>
                {s.nilai !== undefined ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
                    Nilai: {s.nilai}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">Belum dinilai</span>
                )}
              </div>
              {s.catatan && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Catatan</p>
                  <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 border border-slate-100">{s.catatan}</p>
                </div>
              )}
              <LampiranList lampiran={s.lampiran} label="File yang Dikumpulkan" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const tugas = await fetchTugasById(id);
  return { title: tugas ? `Detail — ${tugas.judul}` : "Tugas" };
}

export default async function GuruTugasDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const [tugas, submisiList] = await Promise.all([
    fetchTugasById(id),
    fetchSemuaSubmisi(id).catch(() => []),
  ]);
  if (!tugas) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/guru/tugas" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
        <ChevronLeft size={16} /> Kembali ke Kelola Tugas
      </Link>

      <article className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <BookMarked size={16} className="text-amber-600" />
            </div>
            <Badge variant="amber">{tugas.kelasNama}</Badge>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">{tugas.judul}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><User size={14} />{tugas.guruNama}</span>
            <span className="flex items-center gap-1.5"><GraduationCap size={14} />{tugas.kelasNama}</span>
            {tugas.deadline && (
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                Deadline: {formatDate(tugas.deadline)}
              </span>
            )}
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Deskripsi / Ketentuan</h2>
            <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700 bg-slate-50 rounded-xl p-4 border border-slate-100">
              {tugas.deskripsi}
            </pre>
          </div>
          <LampiranList lampiran={tugas.lampiran} label="Lampiran" />
        </div>
      </article>

      <SubmisiSiswaSection submisiList={submisiList} />
    </div>
  );
}
```

---

### Task 13: Add view button to LatihanTable

**Files:**
- Modify: `c:\Alex-sistem\E-Learning-app\frontend\src\features\latihan\components\LatihanTable.tsx`

- [ ] **Step 1: Add Eye import and Link to LatihanTable**

Add `Eye` to lucide import and `Link` from next/link. Add view button per row next to the existing Pencil/Trash buttons.

In the imports line, change:
```typescript
import { Pencil, Trash2, Search, Plus, ClipboardList, Paperclip, Calendar } from "lucide-react";
```
to:
```typescript
import { Pencil, Trash2, Search, Plus, ClipboardList, Paperclip, Calendar, Eye } from "lucide-react";
import Link from "next/link";
```

In the actions cell (the `<div className="flex items-center justify-end gap-2">` block), add a Link before the Pencil button:
```tsx
<Link
  href={`/guru/latihan/${l.id}`}
  className="p-2 rounded-lg hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition-colors"
  title="Lihat detail"
>
  <Eye size={15} />
</Link>
```

---

### Task 14: Add view button to TugasTable

**Files:**
- Modify: `c:\Alex-sistem\E-Learning-app\frontend\src\features\tugas\components\TugasTable.tsx`

- [ ] **Step 1: Add Eye import and Link to TugasTable**

Change import:
```typescript
import { Pencil, Trash2, Search, Plus, BookMarked, Paperclip, Calendar } from "lucide-react";
```
to:
```typescript
import { Pencil, Trash2, Search, Plus, BookMarked, Paperclip, Calendar, Eye } from "lucide-react";
import Link from "next/link";
```

In the actions cell, add a Link before the Pencil button:
```tsx
<Link
  href={`/guru/tugas/${t.id}`}
  className="p-2 rounded-lg hover:bg-amber-50 text-slate-500 hover:text-amber-600 transition-colors"
  title="Lihat detail"
>
  <Eye size={15} />
</Link>
```

---

### Task 15: Update TASKS.md

**Files:**
- Modify: `c:\Alex-sistem\E-Learning-app\frontend\docs\TASKS.md`

- [ ] **Step 1: Mark implemented tasks as done**

In Phase 7 (Latihan), mark as done:
- `[x] Buat src/features/latihan/types/latihan.types.ts`
- `[x] Buat src/features/latihan/services/latihan.dummy.ts`
- `[x] Buat src/features/latihan/services/latihan.service.ts`
- `[x] Buat src/features/latihan/actions/create-latihan.action.ts`
- `[x] Buat src/features/latihan/actions/update-latihan.action.ts`
- `[x] Buat src/features/latihan/actions/delete-latihan.action.ts`
- `[x] Buat src/features/latihan/actions/submit-latihan.action.ts`
- `[x] Buat src/app/(dashboard)/guru/latihan/page.tsx`
- `[x] Buat src/features/latihan/components/LatihanTable.tsx`
- `[x] Buat src/features/latihan/components/LatihanFormModal.tsx`
- `[x] Buat src/features/latihan/stores/latihan-ui.store.ts`
- `[x] Buat src/app/(dashboard)/siswa/latihan/page.tsx`
- `[x] Buat src/app/(dashboard)/siswa/latihan/[id]/page.tsx`
- Add new: `[x] Buat src/app/(dashboard)/guru/latihan/[id]/page.tsx`

In Phase 8 (Tugas), mark as done all existing items + add new ones.

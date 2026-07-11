# Ganti Foto Profil (Avatar Upload) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let ADMIN/GURU/SISWA change their own profile photo from a dropdown on the Topbar avatar icon, across the `backend` (upload endpoint) and sibling `frontend` (Next.js UI) repos.

**Architecture:** Backend adds a self-service `POST /api/auth/me/avatar` endpoint (multer image upload, updates `User.avatarUrl`, deletes old file). Frontend adds a dropdown to `Topbar.tsx` with a "Ganti Foto Profil" item that opens a modal; the modal posts to the new endpoint via a server action, which re-writes the `session` cookie, then `router.refresh()` pulls the fresh avatar down through the existing server-rendered layout.

**Tech Stack:** Express + Mongoose + Zod + multer (backend); Next.js 16 Server Actions + `useActionState` + Tailwind v4 (frontend). No new dependencies.

## Global Constraints

- Backend layering: controller → service → repository, never skip a layer (project CLAUDE.md).
- Response shape always via `sendSuccess`/`sendCreated`/`sendError` helpers — never hand-roll JSON.
- IDs are UUID v4 strings (`user.id`), dates ISO 8601 — already handled by existing `uuidId`/`baseSchemaOptions` on `UserModel`, no change needed here.
- Never import Mongoose models outside repository files.
- This repo has **no existing unit test files** (Jest configured, zero `*.test.ts` anywhere) — the established convention here is manual/dev-server verification, not TDD. Every task below ends with a manual verification step (curl or browser) instead of an automated test, matching current project convention.
- Per project CLAUDE.md: check `docs/TASKS.md` before starting, mark items `[x]` immediately when done (Task 5 does this).
- Kill any dev server process on port 8000 after testing it (existing session convention).
- **Neither `backend` nor `frontend` is a git repository** (confirmed: `git rev-parse --is-inside-work-tree` fails in both). Every task below ends with a "Commit" step written as if git were available — **skip those steps as written**. If the user wants history, run `git init` first (ask before doing so, it's a repo-altering action); otherwise treat each "Commit" step as "done, no commit" and move on.

---

### Task 1: Backend — `uploadAvatar` multer instance + old-file cleanup helper

**Files:**
- Modify: `src/middlewares/upload.middleware.ts`

**Interfaces:**
- Produces: `export const uploadAvatar: multer.Multer` (single-file image upload, same disk storage/size limit as `upload`), `export async function deleteUploadedFile(url: string): Promise<void>` (derives filename from a `.../uploads/<filename>` URL, unlinks it from `env.UPLOAD_DIR`, swallows "file not found").

- [ ] **Step 1: Add the image-only multer instance and cleanup helper**

Edit `src/middlewares/upload.middleware.ts` — add `fs/promises` import at top and append after the existing `fileToLampiran` function:

```typescript
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';
import { Request } from 'express';
import { env } from '@/config/env';
```

Append at the end of the file:

```typescript
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

function avatarFileFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void {
  if (IMAGE_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipe file tidak diizinkan: ${file.mimetype}`));
  }
}

export const uploadAvatar = multer({
  storage,
  fileFilter: avatarFileFilter,
  limits: { fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024 },
});

/** Delete a previously uploaded file given its public `/uploads/<filename>` URL. Safe-fails if missing. */
export async function deleteUploadedFile(url: string): Promise<void> {
  const filename = url.split('/uploads/').pop();
  if (!filename) return;
  const filePath = path.resolve(process.cwd(), env.UPLOAD_DIR, filename);
  try {
    await fs.unlink(filePath);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
  }
}
```

- [ ] **Step 2: Type-check**

Run: `npm run type-check`
Expected: no errors (exit code 0).

- [ ] **Step 3: Commit**

```bash
git add src/middlewares/upload.middleware.ts
git commit -m "feat(upload): add image-only avatar multer instance and file cleanup helper"
```

---

### Task 2: Backend — `Session.avatarUrl` type + repository `updateAvatar`

**Files:**
- Modify: `src/modules/auth/auth.types.ts`
- Modify: `src/modules/auth/auth.repository.ts`

**Interfaces:**
- Consumes: `UserModel` from `src/modules/auth/user.model.ts` (already has `avatarUrl?: string`).
- Produces: `Session.avatarUrl?: string`; `export async function updateAvatar(userId: string, avatarUrl: string): Promise<UserDocument | null>`.

- [ ] **Step 1: Add `avatarUrl` to `Session`**

In `src/modules/auth/auth.types.ts`, change:

```typescript
export interface Session {
  userId: string;
  role: Role;
  name: string;
  email: string;
  kelasId?: string;
  nisn?: string;
  nik?: string;
}
```

to:

```typescript
export interface Session {
  userId: string;
  role: Role;
  name: string;
  email: string;
  kelasId?: string;
  nisn?: string;
  nik?: string;
  avatarUrl?: string;
}
```

- [ ] **Step 2: Add `updateAvatar` to the repository**

In `src/modules/auth/auth.repository.ts`, append:

```typescript
export async function updateAvatar(userId: string, avatarUrl: string): Promise<UserDocument | null> {
  return UserModel.findByIdAndUpdate(userId, { avatarUrl }, { new: true }).exec();
}
```

- [ ] **Step 3: Type-check**

Run: `npm run type-check`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/modules/auth/auth.types.ts src/modules/auth/auth.repository.ts
git commit -m "feat(auth): add avatarUrl to Session and repository updateAvatar"
```

---

### Task 3: Backend — service layer `updateAvatar` + fresh `getSessionById`

**Files:**
- Modify: `src/modules/auth/auth.service.ts`

**Interfaces:**
- Consumes: `findById` (existing), `updateAvatar` from `auth.repository.ts` (Task 2), `deleteUploadedFile` from `upload.middleware.ts` (Task 1), `Session` type (Task 2), `AppError.unauthorized`.
- Produces: `export async function updateAvatar(userId: string, avatarUrl: string): Promise<Session>` — later consumed by the controller in Task 4. `getSessionById` now returns `avatarUrl`.

- [ ] **Step 1: Update imports and `getSessionById`, add service `updateAvatar`**

In `src/modules/auth/auth.service.ts`, change the import line:

```typescript
import { findByEmail, findByIdentifier, findById, createAuthUser } from '@/modules/auth/auth.repository';
```

to:

```typescript
import { findByEmail, findByIdentifier, findById, createAuthUser, updateAvatar as updateAvatarRepo } from '@/modules/auth/auth.repository';
import { deleteUploadedFile } from '@/middlewares/upload.middleware';
```

Replace `getSessionById`:

```typescript
export async function getSessionById(userId: string): Promise<Session> {
  const user = await findById(userId);
  if (!user) throw AppError.unauthorized('Akun tidak ditemukan');

  return {
    userId: user.id as string,
    role: user.role,
    name: user.name,
    email: user.email,
    kelasId: user.kelasId,
    nisn: user.nisn,
    nik: user.nik,
    avatarUrl: user.avatarUrl,
  };
}
```

Append below it:

```typescript
export async function updateAvatar(userId: string, avatarUrl: string): Promise<Session> {
  const user = await findById(userId);
  if (!user) throw AppError.unauthorized('Akun tidak ditemukan');

  if (user.avatarUrl) {
    await deleteUploadedFile(user.avatarUrl);
  }

  const updated = await updateAvatarRepo(userId, avatarUrl);
  if (!updated) throw AppError.unauthorized('Akun tidak ditemukan');

  return {
    userId: updated.id as string,
    role: updated.role,
    name: updated.name,
    email: updated.email,
    kelasId: updated.kelasId,
    nisn: updated.nisn,
    nik: updated.nik,
    avatarUrl: updated.avatarUrl,
  };
}
```

- [ ] **Step 2: Type-check**

Run: `npm run type-check`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/modules/auth/auth.service.ts
git commit -m "feat(auth): add service updateAvatar and return avatarUrl from getSessionById"
```

---

### Task 4: Backend — controller + route wiring, `meController` fresh read

**Files:**
- Modify: `src/modules/auth/auth.controller.ts`
- Modify: `src/modules/auth/auth.routes.ts`

**Interfaces:**
- Consumes: `getSessionById`, `updateAvatar` from `auth.service.ts` (Task 3); `uploadAvatar` from `upload.middleware.ts` (Task 1); `authenticate` from `auth.middleware.ts`.
- Produces: route `POST /auth/me/avatar` → `{ success: true, data: Session, message: 'Foto profil berhasil diperbarui' }`; `GET /auth/me` now returns fresh DB data including `avatarUrl`.

- [ ] **Step 1: Update `auth.controller.ts`**

Change the import line:

```typescript
import { login, register } from '@/modules/auth/auth.service';
```

to:

```typescript
import { login, register, getSessionById, updateAvatar } from '@/modules/auth/auth.service';
```

Replace `meController`:

```typescript
export const meController = asyncHandler(async (req: Request, res: Response) => {
  const session = await getSessionById(req.user!.userId);
  sendSuccess(res, session);
});
```

Append `uploadAvatarController`:

```typescript
export const uploadAvatarController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    sendSuccess(res, null, 400, 'File tidak ditemukan');
    return;
  }
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const avatarUrl = `${baseUrl}/uploads/${req.file.filename}`;
  const session = await updateAvatar(req.user!.userId, avatarUrl);
  sendSuccess(res, session, 200, 'Foto profil berhasil diperbarui');
});
```

- [ ] **Step 2: Wire the route**

In `src/modules/auth/auth.routes.ts`, change imports:

```typescript
import { loginController, logoutController, meController, registerController } from '@/modules/auth/auth.controller';
import { authenticate } from '@/middlewares/auth.middleware';
```

to:

```typescript
import { loginController, logoutController, meController, registerController, uploadAvatarController } from '@/modules/auth/auth.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { uploadAvatar } from '@/middlewares/upload.middleware';
```

Append below `router.get('/me', authenticate, meController);`:

```typescript
router.post('/me/avatar', authenticate, uploadAvatar.single('foto'), uploadAvatarController);
```

- [ ] **Step 3: Type-check**

Run: `npm run type-check`
Expected: no errors.

- [ ] **Step 4: Manual verification — start server and upload as seeded siswa**

Run: `npm run db:seed` (if not already seeded), then `npm run dev` in the background, then in another shell:

```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login -H "Content-Type: application/json" -d '{"identifier":"siswa1@elearning.id","password":"password123"}' | node -pe "JSON.parse(require('fs').readFileSync(0)).data.token" 2>/dev/null || echo "check seed for actual siswa email")
curl -s -X POST http://localhost:8000/api/auth/me/avatar -H "Authorization: Bearer $TOKEN" -F "foto=@./package.json;type=image/png"
```

Expected: JSON `{"success":false,...}` with a validation-style error is acceptable here since `package.json` isn't really a PNG — the real check is that the request reaches the route and fails on `fileFilter` (500/multer error), not a 404. To confirm the happy path, repeat with a real image file:

```bash
curl -s -X POST http://localhost:8000/api/auth/me/avatar -H "Authorization: Bearer $TOKEN" -F "foto=@/path/to/any/photo.png;type=image/png"
```

Expected: `{"success":true,"data":{"userId":"...","avatarUrl":"http://localhost:8000/uploads/<uuid>.png",...},"message":"Foto profil berhasil diperbarui"}`

Then: `curl -s http://localhost:8000/api/auth/me -H "Authorization: Bearer $TOKEN"` → confirm `avatarUrl` present and matches. Kill the dev server (port 8000) after verifying (project convention).

- [ ] **Step 5: Commit**

```bash
git add src/modules/auth/auth.controller.ts src/modules/auth/auth.routes.ts
git commit -m "feat(auth): add POST /auth/me/avatar endpoint, meController reads fresh session"
```

---

### Task 5: Backend — docs (`MODELS.md`, `TASKS.md`)

**Files:**
- Modify: `docs/MODELS.md`
- Modify: `docs/TASKS.md`

- [ ] **Step 1: Update `docs/MODELS.md`**

In the `### Session` section, change:

```typescript
interface Session {
  userId: string;
  role: "ADMIN" | "GURU" | "SISWA";
  name: string;
  email: string;
}
```

to:

```typescript
interface Session {
  userId: string;
  role: "ADMIN" | "GURU" | "SISWA";
  name: string;
  email: string;
  avatarUrl?: string;
}
```

Add a row to the Auth endpoints table:

```markdown
| `POST` | `/auth/me/avatar` | multipart, field `foto` (image) | `Session` (updated, includes `avatarUrl`) |
```

- [ ] **Step 2: Update `docs/TASKS.md`**

Under `## Phase 2 — Auth` → `### Layer`, add and immediately check off:

```markdown
- [x] `POST /auth/me/avatar` — self-service ganti foto profil (semua role), hapus foto lama dari disk
```

- [ ] **Step 3: Commit**

```bash
git add docs/MODELS.md docs/TASKS.md
git commit -m "docs: document avatarUrl on Session and POST /auth/me/avatar"
```

---

### Task 6: Frontend — `Session.avatarUrl` type + include at login

**Files:**
- Modify: `src/features/auth/types/auth.types.ts`
- Modify: `src/features/auth/actions/login.action.ts`

**Interfaces:**
- Produces: `Session.avatarUrl?: string` (frontend), used by `Topbar.tsx` (Task 9) and `upload-avatar.action.ts` (Task 7).

- [ ] **Step 1: Add `avatarUrl` to frontend `Session`**

In `src/features/auth/types/auth.types.ts`, change:

```typescript
export interface Session {
  userId: string;
  role: Role;
  name: string;
  email: string;
  kelasId?: string;
  nisn?: string;
  nik?: string;
}
```

to:

```typescript
export interface Session {
  userId: string;
  role: Role;
  name: string;
  email: string;
  kelasId?: string;
  nisn?: string;
  nik?: string;
  avatarUrl?: string;
}
```

- [ ] **Step 2: Include `avatarUrl` when setting the session cookie at login**

In `src/features/auth/actions/login.action.ts`, update the `json.data` type annotation:

```typescript
    const json: {
      success: boolean;
      data?: { token: string; user: { userId: string; role: Role; name: string; email: string; kelasId?: string; nisn?: string; nik?: string; avatarUrl?: string } };
      error?: string;
    } = await res.json();
```

Update the real-backend cookie write:

```typescript
    if (json.success && json.data) {
      const { token, user } = json.data;
      const cookieStore = await cookies();
      cookieStore.set("session", JSON.stringify({
        userId: user.userId, role: user.role, name: user.name,
        email: user.email, kelasId: user.kelasId,
        nisn: user.nisn, nik: user.nik, avatarUrl: user.avatarUrl,
      }), COOKIE_OPTS);
      cookieStore.set("token", token, COOKIE_OPTS);
      redirect(ROLE_REDIRECT[user.role]);
    }
```

(The dummy-fallback branch below is left as-is — dummy users have no `avatarUrl`, and `Session.avatarUrl` is optional.)

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/features/auth/types/auth.types.ts src/features/auth/actions/login.action.ts
git commit -m "feat(auth): add avatarUrl to Session type and login cookie"
```

---

### Task 7: Frontend — upload helper + server action

**Files:**
- Modify: `src/lib/upload.ts`
- Create: `src/features/auth/actions/upload-avatar.action.ts`

**Interfaces:**
- Consumes: `Session` type (Task 6), `ActionResponse` from `src/lib/types.ts`.
- Produces: `uploadAvatarFile(file: File): Promise<Session>` (in `lib/upload.ts`); `uploadAvatarAction(prevState: ActionResponse<Session> | null, formData: FormData): Promise<ActionResponse<Session>>` — consumed by `AvatarUploadModal.tsx` (Task 8).

- [ ] **Step 1: Add `uploadAvatarFile` to `src/lib/upload.ts`**

Append to `src/lib/upload.ts` (add the `Session` import alongside the existing `Lampiran` import):

```typescript
import { cookies } from "next/headers";
import type { Lampiran } from "@/lib/types";
import type { Session } from "@/features/auth/types/auth.types";
```

Append at the end of the file:

```typescript
export async function uploadAvatarFile(file: File): Promise<Session> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const fd = new FormData();
  fd.append("foto", file);

  const res = await fetch(`${API_URL}/auth/me/avatar`, {
    method: "POST",
    headers: authHeader,
    body: fd,
  });

  const json: BackendResponse<Session> = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.error ?? "Gagal mengupload foto profil");
  }

  return json.data;
}
```

- [ ] **Step 2: Create `upload-avatar.action.ts`**

Create `src/features/auth/actions/upload-avatar.action.ts`:

```typescript
"use server";

import { cookies } from "next/headers";
import type { ActionResponse } from "@/lib/types";
import type { Session } from "../types/auth.types";
import { uploadAvatarFile } from "@/lib/upload";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
};

export async function uploadAvatarAction(
  _prevState: ActionResponse<Session> | null,
  formData: FormData
): Promise<ActionResponse<Session>> {
  const file = formData.get("foto");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Pilih file foto terlebih dahulu." };
  }

  try {
    const session = await uploadAvatarFile(file);
    const cookieStore = await cookies();
    cookieStore.set("session", JSON.stringify(session), COOKIE_OPTS);
    return { success: true, data: session };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Gagal mengupload foto profil.";
    return { success: false, error: message };
  }
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/upload.ts src/features/auth/actions/upload-avatar.action.ts
git commit -m "feat(auth): add avatar upload helper and server action"
```

---

### Task 8: Frontend — `AvatarUploadModal` component

**Files:**
- Create: `src/features/auth/components/AvatarUploadModal.tsx`

**Interfaces:**
- Consumes: `uploadAvatarAction` (Task 7), `useActionFeedback` (`src/hooks/useActionFeedback.ts`), `FormError` (`src/components/ui/FormError.tsx`), `ActionResponse`/`Session` types.
- Produces: `export function AvatarUploadModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void })` — consumed by `Topbar.tsx` (Task 9). Calls `router.refresh()` internally on success before closing.

- [ ] **Step 1: Create the component**

Create `src/features/auth/components/AvatarUploadModal.tsx`:

```typescript
"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { uploadAvatarAction } from "../actions/upload-avatar.action";
import { useActionFeedback } from "@/hooks/useActionFeedback";
import { FormError } from "@/components/ui/FormError";
import type { ActionResponse } from "@/lib/types";
import type { Session } from "../types/auth.types";

export function AvatarUploadModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [state, action, isPending] = useActionState<ActionResponse<Session> | null, FormData>(
    uploadAvatarAction,
    null
  );

  const handleSuccess = () => {
    router.refresh();
    setPreview(null);
    onClose();
  };

  const error = useActionFeedback(state, "Foto profil berhasil diperbarui.", handleSuccess);

  if (!isOpen) return null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPreview(null);
      return;
    }
    setPreview(URL.createObjectURL(file));
  }

  function handleClose() {
    setPreview(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">Ganti Foto Profil</h2>
          <button type="button" onClick={handleClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
            <X size={18} />
          </button>
        </div>
        <form action={action} className="p-6 space-y-4">
          <div className="flex justify-center">
            {preview ? (
              <img src={preview} alt="Preview foto profil" className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                Belum ada foto
              </div>
            )}
          </div>
          <input
            type="file"
            name="foto"
            accept="image/jpeg,image/png,image/gif,image/webp"
            required
            disabled={isPending}
            onChange={handleFileChange}
            className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          <FormError error={error} />
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
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
              {isPending ? "Mengupload..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/auth/components/AvatarUploadModal.tsx
git commit -m "feat(auth): add AvatarUploadModal component"
```

---

### Task 9: Frontend — `Topbar.tsx` dropdown + real avatar image

**Files:**
- Modify: `src/components/layout/Topbar.tsx`

**Interfaces:**
- Consumes: `AvatarUploadModal` (Task 8), `logoutAction` (`src/features/auth/actions/logout.action.ts`, existing), `Session.avatarUrl` (Task 6).

- [ ] **Step 1: Rewrite `Topbar.tsx`**

Replace the full contents of `src/components/layout/Topbar.tsx`:

```typescript
"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, Camera, LogOut } from "lucide-react";
import { useUIStore } from "@/stores/ui.store";
import { Role, type Session } from "@/features/auth/types/auth.types";
import { logoutAction } from "@/features/auth/actions/logout.action";
import { AvatarUploadModal } from "@/features/auth/components/AvatarUploadModal";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Topbar({ session }: { session: Session }) {
  const { toggleSidebar } = useUIStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-10 shrink-0">
      <button
        type="button"
        onClick={toggleSidebar}
        className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 lg:hidden"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Spacer on desktop since sidebar takes left space */}
      <div className="hidden lg:block" />

      <div className="relative flex items-center gap-3" ref={menuRef}>
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-slate-900 leading-none">
            {session.name}
          </p>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">
            {session.role === Role.SISWA
              ? (session.nisn ?? session.email)
              : session.role === Role.GURU
              ? (session.nik ?? session.email)
              : session.email}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shrink-0 overflow-hidden"
          aria-label="Menu profil"
        >
          {session.avatarUrl ? (
            <img src={session.avatarUrl} alt={session.name} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <span className="text-white text-xs font-semibold">
              {getInitials(session.name)}
            </span>
          )}
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-20">
            <button
              type="button"
              onClick={() => {
                setModalOpen(true);
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Camera size={16} className="shrink-0" />
              Ganti Foto Profil
            </button>
            <form action={logoutAction}>
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <LogOut size={16} className="shrink-0" />
                Logout
              </button>
            </form>
          </div>
        )}
      </div>

      <AvatarUploadModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </header>
  );
}
```

- [ ] **Step 2: Type-check and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Manual browser verification**

Run backend: `cd ../backend && npm run dev` (background).
Run frontend: `npm run dev` (background).

In browser: log in as a seeded siswa/guru/admin (`password123`), open the dashboard, click the avatar in the Topbar → confirm the dropdown shows "Ganti Foto Profil" and "Logout" → click "Ganti Foto Profil" → confirm modal opens with file picker → pick an image → confirm live preview shows → click "Upload" → confirm toast success, modal closes, avatar in Topbar updates to the uploaded image → reload the page → confirm the avatar image persists (session cookie carries the new `avatarUrl`).

Also verify: click outside the open dropdown closes it without navigating; "Logout" still logs out correctly.

Kill both dev servers (backend port 8000, frontend port 3000) after verifying.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Topbar.tsx
git commit -m "feat(auth): add profile-photo dropdown and live avatar to Topbar"
```

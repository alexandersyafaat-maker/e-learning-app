"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ActionResponse } from "@/lib/types";
import { Role } from "../types/auth.types";
import { loginRequest } from "../services/auth.dummy";

const ROLE_REDIRECT: Record<Role, string> = {
  [Role.ADMIN]: "/admin/akun",
  [Role.GURU]: "/guru/materi",
  [Role.SISWA]: "/siswa/materi",
};

const API_URL = process.env.API_URL ?? "http://localhost:8000/api";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
};

export async function loginAction(
  _prevState: ActionResponse<never> | null,
  formData: FormData
): Promise<ActionResponse<never>> {
  const identifier = (formData.get("identifier") as string)?.trim();
  const password = formData.get("password") as string;

  if (!identifier || !password) {
    return { success: false, error: "NISN / NIK / Email dan password wajib diisi." };
  }

  // --- Try real backend first ---
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    const json: {
      success: boolean;
      data?: { token: string; user: { userId: string; role: Role; name: string; email: string; kelasId?: string; nisn?: string; nik?: string; avatarUrl?: string } };
      error?: string;
    } = await res.json();

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

    // Backend reachable but returned error (wrong password, etc.)
    return { success: false, error: json.error ?? "NISN / NIK / Email atau password salah." };
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e; // re-throw redirect/notFound
    // Backend not reachable → fallback to dummy data
  }

  // --- Dummy fallback ---
  const user = await loginRequest(identifier, password);
  if (!user) return { success: false, error: "NISN / NIK / Email atau password salah." };

  const cookieStore = await cookies();
  cookieStore.set("session", JSON.stringify({
    userId: user.id, role: user.role, name: user.name, email: user.email,
  }), COOKIE_OPTS);

  redirect(ROLE_REDIRECT[user.role]);
}

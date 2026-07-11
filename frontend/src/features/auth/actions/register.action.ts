"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ActionResponse } from "@/lib/types";
import { Role } from "../types/auth.types";
import { registerRequest } from "../services/auth.dummy";

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

export async function registerAction(
  _prevState: ActionResponse<never> | null,
  formData: FormData
): Promise<ActionResponse<never>> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const role = ((formData.get("role") as string) || Role.SISWA) as Role;
  const kelasId = (formData.get("kelasId") as string) || undefined;
  const nisn = (formData.get("nisn") as string)?.trim() || undefined;
  const nik = (formData.get("nik") as string)?.trim() || undefined;

  if (!name || !email || !password || !confirmPassword) {
    return { success: false, error: "Semua field wajib diisi." };
  }
  if (password.length < 6) {
    return { success: false, error: "Password minimal 6 karakter." };
  }
  if (password !== confirmPassword) {
    return { success: false, error: "Konfirmasi password tidak cocok." };
  }
  if (!([Role.GURU, Role.SISWA] as string[]).includes(role)) {
    return { success: false, error: "Role tidak valid." };
  }
  if (role === Role.SISWA && !nisn) {
    return { success: false, error: "NISN wajib diisi untuk Siswa." };
  }
  if (role === Role.GURU && !nik) {
    return { success: false, error: "NIK wajib diisi untuk Guru." };
  }
  if (role === Role.SISWA && !kelasId) {
    return { success: false, error: "Siswa harus memilih kelas." };
  }

  // --- Try real backend first ---
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role, kelasId, nisn, nik }),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    const json: {
      success: boolean;
      data?: { token: string; user: { userId: string; role: Role; name: string; email: string; kelasId?: string; nisn?: string; nik?: string } };
      error?: string;
    } = await res.json();

    if (json.success && json.data) {
      const { token, user } = json.data;
      const cookieStore = await cookies();
      cookieStore.set("session", JSON.stringify({
        userId: user.userId, role: user.role, name: user.name,
        email: user.email, kelasId: user.kelasId,
        nisn: user.nisn, nik: user.nik,
      }), COOKIE_OPTS);
      cookieStore.set("token", token, COOKIE_OPTS);
      redirect(ROLE_REDIRECT[user.role]);
    }

    return { success: false, error: json.error ?? "Registrasi gagal." };
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e; // re-throw redirect/notFound
    // Backend not reachable → fallback to dummy data
  }

  // --- Dummy fallback ---
  const result = await registerRequest({ name, email, password, role, kelasId });
  if (result === "email_taken") {
    return { success: false, error: "Email sudah digunakan." };
  }

  const cookieStore = await cookies();
  cookieStore.set("session", JSON.stringify({
    userId: result.id, role: result.role, name: result.name,
    email: result.email, kelasId: result.kelasId,
  }), COOKIE_OPTS);

  redirect(ROLE_REDIRECT[result.role]);
}

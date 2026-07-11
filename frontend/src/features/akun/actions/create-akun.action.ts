"use server";

import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/lib/types";
import { Role } from "@/features/auth/types/auth.types";
import type { Akun } from "../types/akun.types";
import { createAkunRequest } from "../services/akun.service";

export async function createAkunAction(
  _prevState: ActionResponse<Akun> | null,
  formData: FormData
): Promise<ActionResponse<Akun>> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const role = formData.get("role") as Role;
  const nisn = (formData.get("nisn") as string)?.trim() || undefined;
  const nik = (formData.get("nik") as string)?.trim() || undefined;
  const kelasId = (formData.get("kelasId") as string) || undefined;

  if (!name || !email || !password || !role) {
    return { success: false, error: "Semua field wajib diisi." };
  }
  if (role === Role.SISWA && !nisn) {
    return { success: false, error: "NISN wajib diisi untuk Siswa." };
  }
  if (role === Role.GURU && !nik) {
    return { success: false, error: "NIK wajib diisi untuk Guru." };
  }

  if (!Object.values(Role).includes(role)) {
    return { success: false, error: "Role tidak valid." };
  }

  try {
    const akun = await createAkunRequest({ name, email, password, role, nisn, nik, kelasId });
    revalidatePath("/admin/akun");
    return { success: true, data: akun };
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e;
    return { success: false, error: e instanceof Error ? e.message : "Terjadi kesalahan." };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/lib/types";
import { Role } from "@/features/auth/types/auth.types";
import type { Akun } from "../types/akun.types";
import { updateAkunRequest } from "../services/akun.service";

export async function updateAkunAction(
  _prevState: ActionResponse<Akun> | null,
  formData: FormData
): Promise<ActionResponse<Akun>> {
  const id = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = (formData.get("password") as string) || undefined;
  const role = formData.get("role") as Role;
  const nisn = (formData.get("nisn") as string)?.trim() || undefined;
  const nik = (formData.get("nik") as string)?.trim() || undefined;
  const kelasId = (formData.get("kelasId") as string) || undefined;

  if (!id || !name || !email || !role) {
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
    const akun = await updateAkunRequest(id, { name, email, password, role, nisn, nik, kelasId });
    if (!akun) return { success: false, error: "Akun tidak ditemukan." };
    revalidatePath("/admin/akun");
    return { success: true, data: akun };
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e;
    return { success: false, error: e instanceof Error ? e.message : "Terjadi kesalahan." };
  }
}

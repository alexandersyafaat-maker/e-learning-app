"use server";

import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/lib/types";
import { Role } from "@/features/auth/types/auth.types";
import { getSession } from "@/lib/session";
import type { Kelas } from "../types/kelas.types";
import { createKelasRequest } from "../services/kelas.service";

export async function createKelasAction(
  _prevState: ActionResponse<Kelas> | null,
  formData: FormData
): Promise<ActionResponse<Kelas>> {
  const session = await getSession();
  if (!session || session.role !== Role.ADMIN) {
    return { success: false, error: "Tidak memiliki akses." };
  }

  const nama = (formData.get("nama") as string)?.trim();
  const tingkat = (formData.get("tingkat") as string)?.trim();
  const tahunAjaran = (formData.get("tahunAjaran") as string)?.trim();
  const deskripsi = (formData.get("deskripsi") as string)?.trim() || undefined;

  if (!nama || !tingkat || !tahunAjaran) {
    return { success: false, error: "Nama, tingkat, dan tahun ajaran wajib diisi." };
  }

  try {
    const kelas = await createKelasRequest({ nama, tingkat, tahunAjaran, deskripsi });
    revalidatePath("/admin/kelas");
    return { success: true, data: kelas };
  } catch (e) {
    if (e && typeof e === 'object' && 'digest' in e) throw e;
    return { success: false, error: e instanceof Error ? e.message : 'Terjadi kesalahan.' };
  }
}
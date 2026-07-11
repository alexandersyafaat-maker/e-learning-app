"use server";

import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/lib/types";
import type { Kelas } from "../types/kelas.types";
import { updateKelasRequest } from "../services/kelas.service";

export async function updateKelasAction(
  _prevState: ActionResponse<Kelas> | null,
  formData: FormData
): Promise<ActionResponse<Kelas>> {
  const id = formData.get("id") as string;
  const nama = (formData.get("nama") as string)?.trim();
  const tingkat = (formData.get("tingkat") as string)?.trim();
  const tahunAjaran = (formData.get("tahunAjaran") as string)?.trim();
  const deskripsi = (formData.get("deskripsi") as string)?.trim() || undefined;

  if (!id || !nama || !tingkat || !tahunAjaran) {
    return { success: false, error: "Nama, tingkat, dan tahun ajaran wajib diisi." };
  }

  try {
    const kelas = await updateKelasRequest(id, { nama, tingkat, tahunAjaran, deskripsi });
    if (!kelas) return { success: false, error: "Kelas tidak ditemukan." };
  
    revalidatePath("/admin/kelas");
    return { success: true, data: kelas };
  } catch (e) {
    if (e && typeof e === 'object' && 'digest' in e) throw e;
    return { success: false, error: e instanceof Error ? e.message : 'Terjadi kesalahan.' };
  }
}
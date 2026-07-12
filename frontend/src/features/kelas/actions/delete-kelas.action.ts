"use server";

import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/lib/types";
import { Role } from "@/features/auth/types/auth.types";
import { getSession } from "@/lib/session";
import { deleteKelasRequest } from "../services/kelas.service";

export async function deleteKelasAction(id: string): Promise<ActionResponse<void>> {
  const session = await getSession();
  if (!session || session.role !== Role.ADMIN) {
    return { success: false, error: "Tidak memiliki akses." };
  }

  if (!id) return { success: false, error: "ID tidak valid." };

  try {
    const deleted = await deleteKelasRequest(id);
    if (!deleted) return { success: false, error: "Kelas tidak ditemukan." };
  
    revalidatePath("/admin/kelas");
    return { success: true, data: undefined };
  } catch (e) {
    if (e && typeof e === 'object' && 'digest' in e) throw e;
    return { success: false, error: e instanceof Error ? e.message : 'Terjadi kesalahan.' };
  }
}
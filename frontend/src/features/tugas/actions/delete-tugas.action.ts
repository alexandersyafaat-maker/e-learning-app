"use server";

import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/lib/types";
import { deleteTugasRequest } from "../services/tugas.service";

export async function deleteTugasAction(id: string): Promise<ActionResponse<void>> {
  if (!id) return { success: false, error: "ID tidak valid." };
  try {
    const deleted = await deleteTugasRequest(id);
    if (!deleted) return { success: false, error: "Tugas tidak ditemukan." };
    revalidatePath("/guru/tugas");
    return { success: true, data: undefined };
  } catch (e) {
    if (e && typeof e === 'object' && 'digest' in e) throw e;
    return { success: false, error: e instanceof Error ? e.message : 'Terjadi kesalahan.' };
  }
}
"use server";

import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/lib/types";
import { deleteMateriRequest } from "../services/materi.service";

export async function deleteMateriAction(id: string): Promise<ActionResponse<void>> {
  if (!id) return { success: false, error: "ID tidak valid." };

  try {
    const deleted = await deleteMateriRequest(id);
    if (!deleted) return { success: false, error: "Materi tidak ditemukan." };
  
    revalidatePath("/guru/materi");
    return { success: true, data: undefined };
  } catch (e) {
    if (e && typeof e === 'object' && 'digest' in e) throw e;
    return { success: false, error: e instanceof Error ? e.message : 'Terjadi kesalahan.' };
  }
}
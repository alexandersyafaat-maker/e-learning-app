"use server";

import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/lib/types";
import { deleteLatihanRequest } from "../services/latihan.service";

export async function deleteLatihanAction(id: string): Promise<ActionResponse<void>> {
  if (!id) return { success: false, error: "ID tidak valid." };
  try {
    const deleted = await deleteLatihanRequest(id);
    if (!deleted) return { success: false, error: "Latihan tidak ditemukan." };
    revalidatePath("/guru/latihan");
    return { success: true, data: undefined };
  } catch (e) {
    if (e && typeof e === 'object' && 'digest' in e) throw e;
    return { success: false, error: e instanceof Error ? e.message : 'Terjadi kesalahan.' };
  }
}
"use server";

import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/lib/types";
import { deletePertemuanRequest } from "../services/pertemuan.service";

export async function deletePertemuanAction(id: string): Promise<ActionResponse<void>> {
  if (!id) return { success: false, error: "ID tidak valid." };

  try {
    const deleted = await deletePertemuanRequest(id);
    if (!deleted) return { success: false, error: "Pertemuan tidak ditemukan." };
    revalidatePath("/guru/pertemuan");
    return { success: true, data: undefined };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal menghapus pertemuan.",
    };
  }
}

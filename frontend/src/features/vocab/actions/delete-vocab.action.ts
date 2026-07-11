"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { deleteVocabRequest } from "../services/vocab.service";
import type { ActionResponse } from "@/lib/types";

export async function deleteVocabAction(cardId: string): Promise<ActionResponse> {
  const session = await getSession();
  if (!session) return { success: false, error: "Tidak terautentikasi." };

  const deleted = await deleteVocabRequest(cardId);
  if (!deleted) return { success: false, error: "Kartu tidak ditemukan." };

  revalidatePath("/guru/vocab");
  return { success: true, data: undefined };
}

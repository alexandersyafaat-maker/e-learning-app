"use server";

import { getSession } from "@/lib/session";
import { updateSRSProgress } from "../services/vocab.service";
import type { ActionResponse } from "@/lib/types";
import type { SRSProgress } from "../types/vocab.types";

export async function reviewVocabAction(
  cardId: string,
  quality: number
): Promise<ActionResponse<SRSProgress>> {
  const session = await getSession();
  if (!session) return { success: false, error: "Tidak terautentikasi." };

  if (quality < 0 || quality > 5) {
    return { success: false, error: "Nilai kualitas tidak valid." };
  }

  try {
    const progress = await updateSRSProgress(cardId, session.userId, quality);
    return { success: true, data: progress };
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e;
    return { success: false, error: e instanceof Error ? e.message : "Terjadi kesalahan." };
  }
}

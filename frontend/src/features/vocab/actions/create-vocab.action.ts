"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { createVocabRequest } from "../services/vocab.service";
import type { ActionResponse } from "@/lib/types";
import type { VocabCard } from "../types/vocab.types";

export async function createVocabAction(
  _prev: unknown,
  formData: FormData
): Promise<ActionResponse<VocabCard>> {
  const session = await getSession();
  if (!session) return { success: false, error: "Tidak terautentikasi." };

  const word = (formData.get("word") as string)?.trim();
  const translation = (formData.get("translation") as string)?.trim();
  const definition = (formData.get("definition") as string)?.trim();
  const example = (formData.get("example") as string)?.trim();
  const kelasId = (formData.get("kelasId") as string)?.trim();
  const v1 = (formData.get("v1") as string)?.trim() || undefined;
  const v2 = (formData.get("v2") as string)?.trim() || undefined;
  const v3 = (formData.get("v3") as string)?.trim() || undefined;
  const ving = (formData.get("ving") as string)?.trim() || undefined;
  const vs = (formData.get("vs") as string)?.trim() || undefined;

  if (!word || !translation || !definition || !example || !kelasId) {
    return { success: false, error: "Semua field wajib diisi." };
  }

  try {
    const card = await createVocabRequest({
      word,
      translation,
      definition,
      example,
      v1,
      v2,
      v3,
      ving,
      vs,
      kelasId,
      guruId: session.userId,
    });
  
    revalidatePath("/guru/vocab");
    return { success: true, data: card };
  } catch (e) {
    if (e && typeof e === 'object' && 'digest' in e) throw e;
    return { success: false, error: e instanceof Error ? e.message : 'Terjadi kesalahan.' };
  }
}
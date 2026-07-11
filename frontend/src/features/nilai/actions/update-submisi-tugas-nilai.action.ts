"use server";

import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/lib/types";
import { getSession } from "@/lib/session";
import type { UpdateNilaiInput } from "../types/nilai.types";
import { updateSubmisiTugasNilaiRequest } from "../services/nilai.service";

export async function updateSubmisiTugasNilaiAction(
  tugasId: string,
  submisiId: string,
  data: UpdateNilaiInput
): Promise<ActionResponse<void>> {
  const session = await getSession();
  if (!session) return { success: false, error: "Sesi tidak valid." };
  if (session.role !== "GURU") return { success: false, error: "Akses ditolak." };

  if (data.nilai < 0 || data.nilai > 100 || !Number.isInteger(data.nilai)) {
    return { success: false, error: "Nilai harus bilangan bulat antara 0–100." };
  }

  try {
    await updateSubmisiTugasNilaiRequest(tugasId, submisiId, data);
    revalidatePath("/guru/nilai");
    return { success: true, data: undefined };
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e;
    return { success: false, error: e instanceof Error ? e.message : "Terjadi kesalahan." };
  }
}

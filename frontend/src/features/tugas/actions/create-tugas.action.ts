"use server";

import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/lib/types";
import { getSession } from "@/lib/session";
import type { Tugas } from "../types/tugas.types";
import { createTugasRequest } from "../services/tugas.service";
import { uploadLampiranFiles } from "@/lib/upload";

export async function createTugasAction(
  _prev: ActionResponse<Tugas> | null,
  formData: FormData
): Promise<ActionResponse<Tugas>> {
  const session = await getSession();
  if (!session) return { success: false, error: "Sesi tidak valid." };

  const judul = (formData.get("judul") as string)?.trim();
  const deskripsi = (formData.get("deskripsi") as string)?.trim();
  const kelasId = formData.get("kelasId") as string;
  const deadline = (formData.get("deadline") as string) || undefined;

  if (!judul || !deskripsi || !kelasId) {
    return { success: false, error: "Judul, deskripsi, dan kelas wajib diisi." };
  }

  try {
    const files = formData.getAll("lampiran") as File[];
    const lampiran = await uploadLampiranFiles(files, "/tugas/upload/lampiran");

    const tugas = await createTugasRequest({
      judul,
      deskripsi,
      kelasId,
      guruId: session.userId,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
      lampiran,
    });
    revalidatePath("/guru/tugas");
    return { success: true, data: tugas };
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e;
    return { success: false, error: e instanceof Error ? e.message : "Terjadi kesalahan." };
  }
}

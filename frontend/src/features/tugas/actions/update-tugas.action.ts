"use server";

import { revalidatePath } from "next/cache";
import type { ActionResponse, Lampiran } from "@/lib/types";
import type { Tugas } from "../types/tugas.types";
import { updateTugasRequest } from "../services/tugas.service";
import { uploadLampiranFiles } from "@/lib/upload";

export async function updateTugasAction(
  _prev: ActionResponse<Tugas> | null,
  formData: FormData
): Promise<ActionResponse<Tugas>> {
  const id = formData.get("id") as string;
  const judul = (formData.get("judul") as string)?.trim();
  const deskripsi = (formData.get("deskripsi") as string)?.trim();
  const kelasId = formData.get("kelasId") as string;
  const deadline = (formData.get("deadline") as string) || undefined;

  if (!id || !judul || !deskripsi || !kelasId) {
    return { success: false, error: "Judul, deskripsi, dan kelas wajib diisi." };
  }

  let keptLampiran: Lampiran[] = [];
  try {
    const raw = formData.get("keptLampiran") as string;
    if (raw) keptLampiran = JSON.parse(raw) as Lampiran[];
  } catch { /* ignore */ }

  try {
    const files = formData.getAll("lampiran") as File[];
    const newLampiran = await uploadLampiranFiles(files, "/tugas/upload/lampiran");
    const lampiran = [...keptLampiran, ...newLampiran];

    const tugas = await updateTugasRequest(id, {
      judul,
      deskripsi,
      kelasId,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
      lampiran,
    });
    if (!tugas) return { success: false, error: "Tugas tidak ditemukan." };

    revalidatePath("/guru/tugas");
    return { success: true, data: tugas };
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e;
    return { success: false, error: e instanceof Error ? e.message : "Terjadi kesalahan." };
  }
}

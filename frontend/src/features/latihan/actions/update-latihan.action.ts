"use server";

import { revalidatePath } from "next/cache";
import type { ActionResponse, Lampiran } from "@/lib/types";
import type { Latihan } from "../types/latihan.types";
import { updateLatihanRequest } from "../services/latihan.service";
import { uploadLampiranFiles } from "@/lib/upload";

export async function updateLatihanAction(
  _prev: ActionResponse<Latihan> | null,
  formData: FormData
): Promise<ActionResponse<Latihan>> {
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
    const newLampiran = await uploadLampiranFiles(files, "/latihan/upload/lampiran");
    const lampiran = [...keptLampiran, ...newLampiran];

    const latihan = await updateLatihanRequest(id, {
      judul,
      deskripsi,
      kelasId,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
      lampiran,
    });
    if (!latihan) return { success: false, error: "Latihan tidak ditemukan." };

    revalidatePath("/guru/latihan");
    return { success: true, data: latihan };
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e;
    return { success: false, error: e instanceof Error ? e.message : "Terjadi kesalahan." };
  }
}

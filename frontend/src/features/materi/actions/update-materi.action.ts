"use server";

import { revalidatePath } from "next/cache";
import type { ActionResponse, Lampiran } from "@/lib/types";
import type { Materi } from "../types/materi.types";
import { updateMateriRequest } from "../services/materi.service";
import { uploadLampiranFiles } from "@/lib/upload";

export async function updateMateriAction(
  _prevState: ActionResponse<Materi> | null,
  formData: FormData
): Promise<ActionResponse<Materi>> {
  const id = formData.get("id") as string;
  const judul = (formData.get("judul") as string)?.trim();
  const konten = (formData.get("konten") as string)?.trim();
  const kelasId = formData.get("kelasId") as string;

  if (!id || !judul || !konten || !kelasId) {
    return { success: false, error: "Semua field wajib diisi." };
  }

  let keptLampiran: Lampiran[] = [];
  try {
    const raw = formData.get("keptLampiran") as string;
    if (raw) keptLampiran = JSON.parse(raw) as Lampiran[];
  } catch { /* ignore */ }

  try {
    const files = formData.getAll("lampiran") as File[];
    const newLampiran = await uploadLampiranFiles(files, "/materi/upload/lampiran");
    const lampiran = [...keptLampiran, ...newLampiran];

    const materi = await updateMateriRequest(id, { judul, konten, kelasId, lampiran });
    if (!materi) return { success: false, error: "Materi tidak ditemukan." };

    revalidatePath("/guru/materi");
    return { success: true, data: materi };
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e;
    return { success: false, error: e instanceof Error ? e.message : "Terjadi kesalahan." };
  }
}

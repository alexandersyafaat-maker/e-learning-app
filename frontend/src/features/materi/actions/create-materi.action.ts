"use server";

import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/lib/types";
import { getSession } from "@/lib/session";
import type { Materi } from "../types/materi.types";
import { createMateriRequest } from "../services/materi.service";
import { uploadLampiranFiles } from "@/lib/upload";

export async function createMateriAction(
  _prevState: ActionResponse<Materi> | null,
  formData: FormData
): Promise<ActionResponse<Materi>> {
  const session = await getSession();
  if (!session) return { success: false, error: "Sesi tidak valid." };

  const judul = (formData.get("judul") as string)?.trim();
  const konten = (formData.get("konten") as string)?.trim();
  const kelasId = formData.get("kelasId") as string;

  if (!judul || !konten || !kelasId) {
    return { success: false, error: "Semua field wajib diisi." };
  }

  try {
    const files = formData.getAll("lampiran") as File[];
    const lampiran = await uploadLampiranFiles(files, "/materi/upload/lampiran");

    const materi = await createMateriRequest({
      judul,
      konten,
      kelasId,
      guruId: session.userId,
      lampiran,
    });
    revalidatePath("/guru/materi");
    return { success: true, data: materi };
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e;
    return { success: false, error: e instanceof Error ? e.message : "Terjadi kesalahan." };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/lib/types";
import { getSession } from "@/lib/session";
import type { Latihan } from "../types/latihan.types";
import { createLatihanRequest } from "../services/latihan.service";
import { uploadLampiranFiles } from "@/lib/upload";

export async function createLatihanAction(
  _prev: ActionResponse<Latihan> | null,
  formData: FormData
): Promise<ActionResponse<Latihan>> {
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
    const lampiran = await uploadLampiranFiles(files, "/latihan/upload/lampiran");

    const latihan = await createLatihanRequest({
      judul,
      deskripsi,
      kelasId,
      guruId: session.userId,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
      lampiran,
    });
    revalidatePath("/guru/latihan");
    return { success: true, data: latihan };
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e;
    return { success: false, error: e instanceof Error ? e.message : "Terjadi kesalahan." };
  }
}

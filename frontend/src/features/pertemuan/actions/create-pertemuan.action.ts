"use server";

import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/lib/types";
import { getSession } from "@/lib/session";
import type { Pertemuan } from "../types/pertemuan.types";
import { createPertemuanRequest } from "../services/pertemuan.service";

export async function createPertemuanAction(
  _prev: ActionResponse<Pertemuan> | null,
  formData: FormData
): Promise<ActionResponse<Pertemuan>> {
  const session = await getSession();
  if (!session) return { success: false, error: "Sesi tidak valid." };

  const judul = (formData.get("judul") as string)?.trim();
  const kelasId = formData.get("kelasId") as string;
  const jadwalRaw = formData.get("jadwal") as string;
  const durasiRaw = formData.get("durasi") as string;

  if (!judul || !kelasId || !jadwalRaw || !durasiRaw) {
    return { success: false, error: "Semua field wajib diisi." };
  }

  const durasi = parseInt(durasiRaw, 10);
  if (isNaN(durasi) || durasi < 15 || durasi > 300) {
    return { success: false, error: "Durasi harus antara 15–300 menit." };
  }

  const jadwal = new Date(jadwalRaw).toISOString();

  try {
    const pertemuan = await createPertemuanRequest({
      judul,
      kelasId,
      guruId: session.userId,
      jadwal,
      durasi,
    });
    revalidatePath("/guru/pertemuan");
    return { success: true, data: pertemuan };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal membuat pertemuan.",
    };
  }
}

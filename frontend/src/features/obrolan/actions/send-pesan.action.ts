"use server";

import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/lib/types";
import { getSession } from "@/lib/session";
import { sendPesanRequest } from "../services/obrolan.service";
import type { PesanObrolan } from "../types/obrolan.types";

export async function sendPesanAction(
  materiId: string,
  formData: FormData
): Promise<ActionResponse<PesanObrolan>> {
  const session = await getSession();
  if (!session) return { success: false, error: "Sesi tidak valid." };
  if (session.role !== "GURU" && session.role !== "SISWA") {
    return { success: false, error: "Akses ditolak." };
  }

  const teks = (formData.get("teks") as string)?.trim();
  if (!teks) return { success: false, error: "Pesan tidak boleh kosong." };
  if (teks.length > 1000) return { success: false, error: "Pesan terlalu panjang (maks 1000 karakter)." };

  try {
    const pesan = await sendPesanRequest(materiId, {
      teks,
      userId: session.userId,
      userNama: session.name,
      userRole: session.role as "GURU" | "SISWA",
    });
    revalidatePath(`/guru/materi/${materiId}`);
    revalidatePath(`/siswa/materi/${materiId}`);
    return { success: true, data: pesan };
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e;
    return { success: false, error: e instanceof Error ? e.message : "Terjadi kesalahan." };
  }
}

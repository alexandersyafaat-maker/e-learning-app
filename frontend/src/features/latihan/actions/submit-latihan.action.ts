"use server";

import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/lib/types";
import { getSession } from "@/lib/session";
import type { HasilLatihan } from "../types/latihan.types";
import { fetchHasilBySiswa, submitLatihanRequest } from "../services/latihan.service";
import { uploadLampiranFiles } from "@/lib/upload";

export async function submitLatihanAction(
  _prev: ActionResponse<HasilLatihan> | null,
  formData: FormData
): Promise<ActionResponse<HasilLatihan>> {
  const session = await getSession();
  if (!session) return { success: false, error: "Sesi tidak valid." };

  const latihanId = formData.get("latihanId") as string;
  const jawaban = (formData.get("jawaban") as string)?.trim();

  if (!latihanId) return { success: false, error: "ID latihan tidak valid." };
  if (!jawaban) return { success: false, error: "Jawaban tidak boleh kosong." };

  try {
    const sudahDikumpulkan = await fetchHasilBySiswa(latihanId, session.userId);
    if (sudahDikumpulkan) return { success: false, error: "Latihan sudah dikumpulkan." };

    const files = formData.getAll("lampiran") as File[];
    const lampiran = await uploadLampiranFiles(files, "/latihan/upload/lampiran");

    const hasil = await submitLatihanRequest({
      latihanId,
      siswaId: session.userId,
      jawaban,
      lampiran,
    });

    revalidatePath("/siswa/latihan");
    revalidatePath(`/siswa/latihan/${latihanId}`);
    return { success: true, data: hasil };
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e;
    return { success: false, error: e instanceof Error ? e.message : "Terjadi kesalahan." };
  }
}

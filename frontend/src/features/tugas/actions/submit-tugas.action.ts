"use server";

import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/lib/types";
import { getSession } from "@/lib/session";
import type { SubmisiTugas } from "../types/tugas.types";
import { fetchSubmisiBySiswa, submitTugasRequest } from "../services/tugas.service";
import { uploadLampiranFiles } from "@/lib/upload";

export async function submitTugasAction(
  _prev: ActionResponse<SubmisiTugas> | null,
  formData: FormData
): Promise<ActionResponse<SubmisiTugas>> {
  const session = await getSession();
  if (!session) return { success: false, error: "Sesi tidak valid." };

  const tugasId = formData.get("tugasId") as string;
  const jawaban = (formData.get("jawaban") as string)?.trim() ?? "";
  const catatan = (formData.get("catatan") as string)?.trim() ?? "";

  if (!tugasId) return { success: false, error: "ID tugas tidak valid." };
  if (!jawaban) return { success: false, error: "Jawaban tidak boleh kosong." };

  try {
    const sudahDikumpulkan = await fetchSubmisiBySiswa(tugasId, session.userId);
    if (sudahDikumpulkan) return { success: false, error: "Tugas sudah dikumpulkan." };

    const rawFiles = (formData.getAll("lampiran") as File[]).filter(
      (f) => f instanceof File && f.size > 0
    );
    const lampiran = await uploadLampiranFiles(rawFiles, "/tugas/upload/lampiran");

    const submisi = await submitTugasRequest({
      tugasId,
      siswaId: session.userId,
      jawaban,
      catatan,
      lampiran,
    });

    revalidatePath("/siswa/tugas");
    revalidatePath(`/siswa/tugas/${tugasId}`);
    return { success: true, data: submisi };
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e;
    return { success: false, error: e instanceof Error ? e.message : "Terjadi kesalahan." };
  }
}

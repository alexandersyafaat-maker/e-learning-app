import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { fallbackArray } from "@/lib/utils";
import { fetchHasilLatihanByGuru, fetchSubmisiTugasByGuru } from "@/features/nilai/services/nilai.service";
import { NilaiTable } from "@/features/nilai/components/NilaiTable";
import { NilaiBeriModal } from "@/features/nilai/components/NilaiBeriModal";

export const metadata: Metadata = { title: "Kelola Nilai" };

export default async function GuruNilaiPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [hasilLatihan, submisiTugas] = await Promise.all([
    fallbackArray(fetchHasilLatihanByGuru(session.userId)),
    fallbackArray(fetchSubmisiTugasByGuru(session.userId)),
  ]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Kelola Nilai</h1>
        <p className="text-sm text-slate-500 mt-1">
          Beri dan kelola nilai untuk latihan dan tugas yang dikumpulkan siswa.
        </p>
      </div>

      <NilaiTable hasilLatihan={hasilLatihan} submisiTugas={submisiTugas} />
      <NilaiBeriModal />
    </>
  );
}

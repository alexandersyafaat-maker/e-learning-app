import { fallbackArray } from "@/lib/utils";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { fetchTugasByGuru } from "@/features/tugas/services/tugas.service";
import { fetchKelasList } from "@/features/kelas/services/kelas.service";
import { TugasTable } from "@/features/tugas/components/TugasTable";
import { TugasFormModal } from "@/features/tugas/components/TugasFormModal";
import { DeleteTugasDialog } from "@/features/tugas/components/DeleteTugasDialog";

export const metadata: Metadata = { title: "Kelola Tugas" };

export default async function GuruTugasPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [tugasList, kelasList] = await Promise.all([
    fallbackArray(fetchTugasByGuru(session.userId)),
    fallbackArray(fetchKelasList()),
  ]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Kelola Tugas</h1>
        <p className="text-sm text-slate-500 mt-1">Buat dan kelola tugas untuk kelas Anda.</p>
      </div>
      <TugasTable tugasList={tugasList} />
      <TugasFormModal kelasList={kelasList} />
      <DeleteTugasDialog />
    </>
  );
}

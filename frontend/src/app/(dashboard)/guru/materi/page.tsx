import { fallbackArray } from "@/lib/utils";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { fetchMateriByGuru } from "@/features/materi/services/materi.service";
import { fetchKelasList } from "@/features/kelas/services/kelas.service";
import { MateriTable } from "@/features/materi/components/MateriTable";
import { MateriFormModal } from "@/features/materi/components/MateriFormModal";
import { DeleteMateriDialog } from "@/features/materi/components/DeleteMateriDialog";

export const metadata: Metadata = { title: "Kelola Materi" };

export default async function GuruMateriPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [materiList, kelasList] = await Promise.all([
    fallbackArray(fetchMateriByGuru(session.userId)),
    fallbackArray(fetchKelasList()),
  ]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Kelola Materi</h1>
        <p className="text-sm text-slate-500 mt-1">Buat dan kelola materi pelajaran untuk kelas Anda.</p>
      </div>

      <MateriTable materiList={materiList} />
      <MateriFormModal kelasList={kelasList} />
      <DeleteMateriDialog />
    </>
  );
}

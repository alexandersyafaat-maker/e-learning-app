import { fallbackArray } from "@/lib/utils";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { fetchPertemuanByGuru } from "@/features/pertemuan/services/pertemuan.service";
import { fetchKelasList } from "@/features/kelas/services/kelas.service";
import { PertemuanList } from "@/features/pertemuan/components/PertemuanList";
import { PertemuanFormModal } from "@/features/pertemuan/components/PertemuanFormModal";
import { DeletePertemuanDialog } from "@/features/pertemuan/components/DeletePertemuanDialog";

export const metadata: Metadata = { title: "Pertemuan Virtual" };

export default async function GuruPertemuanPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [pertemuanList, kelasList] = await Promise.all([
    fallbackArray(fetchPertemuanByGuru(session.userId)),
    fallbackArray(fetchKelasList()),
  ]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Pertemuan Virtual</h1>
        <p className="text-sm text-slate-500 mt-1">
          Jadwalkan dan kelola pertemuan Zoom dengan siswa Anda.
        </p>
      </div>

      <PertemuanList pertemuanList={pertemuanList} isGuru />
      <PertemuanFormModal kelasList={kelasList} />
      <DeletePertemuanDialog />
    </>
  );
}

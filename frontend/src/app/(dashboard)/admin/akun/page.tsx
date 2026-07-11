import { fallbackArray } from "@/lib/utils";
import type { Metadata } from "next";
import { fetchAkunList } from "@/features/akun/services/akun.service";
import { fetchKelasList } from "@/features/kelas/services/kelas.service";
import { AkunTable } from "@/features/akun/components/AkunTable";
import { AkunFormModal } from "@/features/akun/components/AkunFormModal";
import { DeleteAkunDialog } from "@/features/akun/components/DeleteAkunDialog";

export const metadata: Metadata = { title: "Kelola Akun" };

export default async function KelolAkunPage() {
  const [akunList, kelasList] = await Promise.all([
    fallbackArray(fetchAkunList()),
    fallbackArray(fetchKelasList()),
  ]);

  return (
    <>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kelola Akun</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manajemen akun pengguna — Admin, Guru, dan Siswa.
          </p>
        </div>
      </div>

      <AkunTable akunList={akunList} />
      <AkunFormModal kelasList={kelasList} />
      <DeleteAkunDialog />
    </>
  );
}

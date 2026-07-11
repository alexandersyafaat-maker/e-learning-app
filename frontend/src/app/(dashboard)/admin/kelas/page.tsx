import { fallbackArray } from "@/lib/utils";
import type { Metadata } from "next";
import { fetchKelasList } from "@/features/kelas/services/kelas.service";
import { KelasTable } from "@/features/kelas/components/KelasTable";
import { KelasFormModal } from "@/features/kelas/components/KelasFormModal";
import { DeleteKelasDialog } from "@/features/kelas/components/DeleteKelasDialog";

export const metadata: Metadata = { title: "Kelola Kelas" };

export default async function KelolKelasPage() {
  const kelasList = await fallbackArray(fetchKelasList());

  return (
    <>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kelola Kelas</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manajemen kelas — tambah, edit, dan hapus kelas.
          </p>
        </div>
      </div>

      <KelasTable kelasList={kelasList} />
      <KelasFormModal />
      <DeleteKelasDialog />
    </>
  );
}

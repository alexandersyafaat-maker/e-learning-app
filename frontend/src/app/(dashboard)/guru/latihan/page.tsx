import { fallbackArray } from "@/lib/utils";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { fetchLatihanByGuru } from "@/features/latihan/services/latihan.service";
import { fetchKelasList } from "@/features/kelas/services/kelas.service";
import { LatihanTable } from "@/features/latihan/components/LatihanTable";
import { LatihanFormModal } from "@/features/latihan/components/LatihanFormModal";
import { DeleteLatihanDialog } from "@/features/latihan/components/DeleteLatihanDialog";

export const metadata: Metadata = { title: "Kelola Latihan" };

export default async function GuruLatihanPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [latihanList, kelasList] = await Promise.all([
    fallbackArray(fetchLatihanByGuru(session.userId)),
    fallbackArray(fetchKelasList()),
  ]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Kelola Latihan</h1>
        <p className="text-sm text-slate-500 mt-1">Buat dan kelola latihan untuk kelas Anda.</p>
      </div>
      <LatihanTable latihanList={latihanList} />
      <LatihanFormModal kelasList={kelasList} />
      <DeleteLatihanDialog />
    </>
  );
}

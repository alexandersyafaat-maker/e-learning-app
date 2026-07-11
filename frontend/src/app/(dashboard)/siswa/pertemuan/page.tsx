import { fallbackArray } from "@/lib/utils";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { fetchPertemuanForSiswa } from "@/features/pertemuan/services/pertemuan.service";
import { PertemuanList } from "@/features/pertemuan/components/PertemuanList";

export const metadata: Metadata = { title: "Pertemuan Virtual" };

export default async function SiswaPertemuanPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const pertemuanList = await fallbackArray(fetchPertemuanForSiswa(session.userId));

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Pertemuan Virtual</h1>
        <p className="text-sm text-slate-500 mt-1">
          Bergabung ke pertemuan Zoom yang dijadwalkan oleh guru Anda.
        </p>
      </div>

      <PertemuanList pertemuanList={pertemuanList} isGuru={false} />
    </>
  );
}

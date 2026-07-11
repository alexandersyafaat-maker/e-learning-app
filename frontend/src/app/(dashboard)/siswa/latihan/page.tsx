import { fallbackArray } from "@/lib/utils";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { getSession } from "@/lib/session";
import { fetchLatihanForSiswa } from "@/features/latihan/services/latihan.service";
import { LatihanCard } from "@/features/latihan/components/LatihanCard";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "Latihan" };

export default async function SiswaLatihanPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const latihanList = await fallbackArray(fetchLatihanForSiswa(session.userId));

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Latihan</h1>
        <p className="text-sm text-slate-500 mt-1">Kerjakan latihan yang diberikan guru Anda.</p>
      </div>

      {latihanList.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Belum ada latihan"
          description="Guru belum menambahkan latihan untuk kelas Anda."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {latihanList.map((item) => (
              <LatihanCard key={item.id} item={item} />
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4">{latihanList.length} latihan tersedia</p>
        </>
      )}
    </>
  );
}

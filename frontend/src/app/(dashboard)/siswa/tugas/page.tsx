import { fallbackArray } from "@/lib/utils";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BookMarked } from "lucide-react";
import { getSession } from "@/lib/session";
import { fetchTugasForSiswa } from "@/features/tugas/services/tugas.service";
import { TugasCard } from "@/features/tugas/components/TugasCard";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "Tugas" };

export default async function SiswaTugasPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const tugasList = await fallbackArray(fetchTugasForSiswa(session.userId));

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Tugas</h1>
        <p className="text-sm text-slate-500 mt-1">Kumpulkan tugas yang diberikan guru Anda.</p>
      </div>

      {tugasList.length === 0 ? (
        <EmptyState
          icon={BookMarked}
          title="Belum ada tugas"
          description="Guru belum menambahkan tugas untuk kelas Anda."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tugasList.map((item) => (
              <TugasCard key={item.id} item={item} />
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4">{tugasList.length} tugas tersedia</p>
        </>
      )}
    </>
  );
}

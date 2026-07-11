import { fallbackArray } from "@/lib/utils";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BookOpen } from "lucide-react";
import { getSession } from "@/lib/session";
import { fetchMateriForSiswa } from "@/features/materi/services/materi.service";
import { MateriCard } from "@/features/materi/components/MateriCard";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "Materi Pelajaran" };

export default async function SiswaMateriPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const materiList = await fallbackArray(fetchMateriForSiswa(session.userId));

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Materi Pelajaran</h1>
        <p className="text-sm text-slate-500 mt-1">Materi yang tersedia untuk kelas Anda.</p>
      </div>

      {materiList.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Belum ada materi"
          description="Guru belum menambahkan materi untuk kelas Anda."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {materiList.map((materi) => (
              <MateriCard key={materi.id} materi={materi} />
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4">{materiList.length} materi tersedia</p>
        </>
      )}
    </>
  );
}

import { fallbackArray } from "@/lib/utils";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { fetchVocabByGuru } from "@/features/vocab/services/vocab.service";
import { fetchKelasList } from "@/features/kelas/services/kelas.service";
import { VocabTable } from "@/features/vocab/components/VocabTable";
import { VocabFormModal } from "@/features/vocab/components/VocabFormModal";
import { DeleteVocabDialog } from "@/features/vocab/components/DeleteVocabDialog";

export const metadata: Metadata = { title: "Kelola Kosakata" };

export default async function GuruVocabPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [cards, kelasList] = await Promise.all([
    fallbackArray(fetchVocabByGuru(session.userId)),
    fallbackArray(fetchKelasList()),
  ]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Kelola Kosakata</h1>
        <p className="text-sm text-slate-500 mt-1">
          Buat kartu kosakata untuk siswa. Siswa akan mereview dengan sistem Spaced Repetition (SRS).
        </p>
      </div>

      <VocabTable cards={cards} />
      <VocabFormModal kelasList={kelasList} />
      <DeleteVocabDialog />
    </>
  );
}

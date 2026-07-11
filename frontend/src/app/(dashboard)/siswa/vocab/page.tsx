import { fallbackArray } from "@/lib/utils";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { fetchCardsForReview } from "@/features/vocab/services/vocab.service";
import { ReviewSession } from "@/features/vocab/components/ReviewSession";
import { BookMarked, Brain } from "lucide-react";

export const metadata: Metadata = { title: "Review Kosakata" };

export default async function SiswaVocabPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const cards = await fallbackArray(fetchCardsForReview(session.userId));

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Review Kosakata</h1>
        <p className="text-sm text-slate-500 mt-1">
          Sesi review harian — sistem memilih kartu yang paling perlu diulangi hari ini.
        </p>
      </div>

      {cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
            <BookMarked size={28} className="text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            Tidak ada kartu untuk direview hari ini
          </h3>
          <p className="text-sm text-slate-400 max-w-sm">
            Semua kartu kosakata sudah direview. Kembali lagi besok — sistem akan memilihkan
            kartu yang tepat berdasarkan jadwal review-mu.
          </p>
        </div>
      ) : (
        <div className="max-w-xl mx-auto">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 mb-6 flex items-start gap-3">
            <Brain size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">
                {cards.length} kartu siap direview
              </p>
              <p className="text-xs text-emerald-600 mt-0.5">
                {cards.filter((c) => c.isNew).length} baru ·{" "}
                {cards.filter((c) => !c.isNew).length} ulangan
              </p>
            </div>
          </div>

          <ReviewSession cards={cards} />
        </div>
      )}
    </>
  );
}

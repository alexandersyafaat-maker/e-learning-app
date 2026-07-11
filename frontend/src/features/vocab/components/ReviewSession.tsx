"use client";

import { useState } from "react";
import { PartyPopper, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { FlipCard } from "./FlipCard";
import { reviewVocabAction } from "../actions/review-vocab.action";
import type { VocabCardWithProgress } from "../types/vocab.types";

interface ReviewSessionProps {
  cards: VocabCardWithProgress[];
}

function SessionComplete({ total, onReset }: { total: number; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
      <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
        <PartyPopper size={36} className="text-emerald-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Sesi Selesai!</h2>
        <p className="text-slate-500 text-sm">
          Kamu telah mereview <span className="font-semibold text-slate-700">{total} kartu</span>{" "}
          hari ini. Kerja bagus!
        </p>
      </div>
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-6 py-4 text-sm text-emerald-800 max-w-xs">
        Sistem akan menentukan kapan kartu ini perlu di-review lagi berdasarkan jawabanmu.
        Kembali lagi besok!
      </div>
      <button
        onClick={onReset}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors"
      >
        <RotateCcw size={15} />
        Review Ulang Sesi Ini
      </button>
    </div>
  );
}

export function ReviewSession({ cards }: ReviewSessionProps) {
  const [sessionCards, setSessionCards] = useState(cards);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState(0);

  const current = sessionCards[currentIdx];

  function handleReset() {
    setSessionCards(cards);
    setCurrentIdx(0);
    setFlipped(false);
    setCompleted(0);
  }

  function handleRate(quality: 0 | 3 | 5) {
    if (!current) return;
    const cardId = current.id;

    // Advance immediately — don't block UI waiting for server
    setFlipped(false);
    setCurrentIdx((idx) => idx + 1);
    setCompleted((c) => c + 1);

    // Save progress in background
    reviewVocabAction(cardId, quality).then((result) => {
      if (!result.success) toast.error(result.error);
    });
  }

  if (currentIdx >= sessionCards.length) {
    return <SessionComplete total={completed} onReset={handleReset} />;
  }

  return (
    <FlipCard
      word={current.word}
      translation={current.translation}
      definition={current.definition}
      example={current.example}
      v1={current.v1}
      v2={current.v2}
      v3={current.v3}
      ving={current.ving}
      vs={current.vs}
      flipped={flipped}
      onFlip={() => setFlipped(true)}
      onRate={handleRate}
      current={currentIdx + 1}
      total={sessionCards.length}
    />
  );
}

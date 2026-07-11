"use client";

import { useTransition } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { handleAction } from "@/lib/action-utils";
import { deleteVocabAction } from "../actions/delete-vocab.action";
import { useVocabUIStore } from "../stores/vocab-ui.store";

export function DeleteVocabDialog() {
  const { deletingCard, setDeletingCard } = useVocabUIStore();
  const [isPending, startTransition] = useTransition();

  if (!deletingCard) return null;

  function handleDelete() {
    if (!deletingCard) return;
    startTransition(async () => {
      await handleAction(await deleteVocabAction(deletingCard.id), {
        successMsg: `Kartu "${deletingCard.word}" dihapus.`,
        onSuccess: () => setDeletingCard(null),
      });
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !isPending && setDeletingCard(null)}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Hapus Kartu Kosakata</h3>
            <p className="text-sm text-slate-500 mt-1">
              Hapus kartu{" "}
              <span className="font-semibold text-slate-700">
                &ldquo;{deletingCard.word}&rdquo;
              </span>
              ? Progress review siswa untuk kartu ini juga akan hilang. Aksi tidak dapat dibatalkan.
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setDeletingCard(null)}
            disabled={isPending}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

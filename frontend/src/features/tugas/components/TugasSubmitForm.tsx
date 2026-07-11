"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { useActionFeedback } from "@/hooks/useActionFeedback";
import { FormError } from "@/components/ui/FormError";
import { submitTugasAction } from "../actions/submit-tugas.action";
import { LampiranUpload } from "@/components/ui/LampiranUpload";
import { GrammarTextarea } from "@/components/ui/GrammarTextarea";
import type { ActionResponse } from "@/lib/types";
import type { SubmisiTugas } from "../types/tugas.types";

export function TugasSubmitForm({ tugasId }: { tugasId: string }) {
  const router = useRouter();
  const [state, action, isPending] = useActionState<ActionResponse<SubmisiTugas> | null, FormData>(
    submitTugasAction,
    null
  );

  const error = useActionFeedback(state, "Tugas berhasil dikumpulkan!", () => router.refresh());

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="tugasId" value={tugasId} />

      <GrammarTextarea
        name="jawaban"
        label="Jawaban"
        required
        disabled={isPending}
        placeholder="Tulis jawaban Anda di sini..."
        hint="Tuliskan jawaban Anda secara lengkap. Gunakan tombol Periksa Grammar untuk mengecek kesalahan bahasa Inggris."
        rows={8}
      />

      <LampiranUpload />

      <GrammarTextarea
        name="catatan"
        label="Catatan"
        disabled={isPending}
        placeholder="Tambahkan catatan untuk guru (opsional)..."
        hint="Opsional. Gunakan Periksa Grammar jika menulis dalam bahasa Inggris."
        rows={3}
      />

      <FormError error={error} />

      <div className="pt-2 border-t border-slate-100">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={16} />
          {isPending ? "Mengumpulkan..." : "Kumpulkan Tugas"}
        </button>
        <p className="text-xs text-slate-400 mt-2">Tugas tidak dapat diubah setelah dikumpulkan.</p>
      </div>
    </form>
  );
}

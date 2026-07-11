"use client";

import { useActionState } from "react";
import { X, BookMarked, Loader2 } from "lucide-react";
import { createVocabAction } from "../actions/create-vocab.action";
import { useVocabUIStore } from "../stores/vocab-ui.store";
import { useActionFeedback } from "@/hooks/useActionFeedback";
import { FormError } from "@/components/ui/FormError";
import type { ActionResponse } from "@/lib/types";
import type { VocabCard } from "../types/vocab.types";
import type { Kelas } from "@/features/kelas/types/kelas.types";

export function VocabFormModal({ kelasList }: { kelasList: Kelas[] }) {
  const { isModalOpen, closeModal } = useVocabUIStore();
  const [state, action, isPending] = useActionState<
    ActionResponse<VocabCard> | null,
    FormData
  >(createVocabAction, null);

  const error = useActionFeedback(state, "Kartu kosakata berhasil ditambahkan!", closeModal);

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <BookMarked size={16} className="text-emerald-600" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Tambah Kartu Kosakata</h2>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form id="vocab-form" action={action} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Kata / Frasa <span className="text-red-500">*</span>
            </label>
            <input
              name="word"
              type="text"
              required
              disabled={isPending}
              placeholder="e.g. accomplish, run away, look forward to"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Terjemahan (Indonesia) <span className="text-red-500">*</span>
            </label>
            <input
              name="translation"
              type="text"
              required
              disabled={isPending}
              placeholder="e.g. menyelesaikan; mencapai"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Definisi (English) <span className="text-red-500">*</span>
            </label>
            <textarea
              name="definition"
              required
              disabled={isPending}
              placeholder="e.g. to achieve or complete something successfully"
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Contoh Kalimat <span className="text-red-500">*</span>
            </label>
            <textarea
              name="example"
              required
              disabled={isPending}
              placeholder="e.g. She accomplished all her goals before the deadline."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
            />
          </div>

          {/* Verb forms — optional */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Bentuk Verb{" "}
              <span className="text-slate-400 font-normal text-xs">(opsional, isi jika kata ini adalah verb)</span>
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {[
                { name: "v1", label: "V1 (Infinitive)", placeholder: "run" },
                { name: "v2", label: "V2 (Past Simple)", placeholder: "ran" },
                { name: "v3", label: "V3 (Past Participle)", placeholder: "run" },
              ].map((field) => (
                <div key={field.name}>
                  <p className="text-[11px] text-slate-500 mb-1">{field.label}</p>
                  <input
                    name={field.name}
                    type="text"
                    disabled={isPending}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: "ving", label: "V-ing (Present Participle)", placeholder: "running" },
                { name: "vs", label: "V-s/es (3rd Person Singular)", placeholder: "runs" },
              ].map((field) => (
                <div key={field.name}>
                  <p className="text-[11px] text-slate-500 mb-1">{field.label}</p>
                  <input
                    name={field.name}
                    type="text"
                    disabled={isPending}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Kelas <span className="text-red-500">*</span>
            </label>
            <select
              name="kelasId"
              required
              disabled={isPending}
              defaultValue=""
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 bg-white"
            >
              <option value="" disabled>Pilih kelas...</option>
              {kelasList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama}
                </option>
              ))}
            </select>
          </div>

          <FormError error={error} />
        </form>

        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end shrink-0">
          <button
            type="button"
            onClick={closeModal}
            disabled={isPending}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            form="vocab-form"
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending && <Loader2 size={15} className="animate-spin" />}
            Simpan Kartu
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useActionState } from "react";
import { X } from "lucide-react";
import { useKelasUIStore } from "../stores/kelas-ui.store";
import { createKelasAction } from "../actions/create-kelas.action";
import { updateKelasAction } from "../actions/update-kelas.action";
import { useActionFeedback } from "@/hooks/useActionFeedback";
import { FormError } from "@/components/ui/FormError";
import type { ActionResponse } from "@/lib/types";
import type { Kelas } from "../types/kelas.types";

const TINGKAT_OPTIONS = ["VII", "VIII", "IX"];

function KelasFormFields({
  isPending,
  error,
  defaultValues,
}: {
  isPending: boolean;
  error?: string;
  defaultValues?: Kelas;
}) {
  const inputClass =
    "w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50";

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Kelas</label>
        <input name="nama" type="text" required disabled={isPending} defaultValue={defaultValues?.nama} placeholder="Contoh: Kelas VII" className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Tingkat</label>
          <select name="tingkat" required disabled={isPending} defaultValue={defaultValues?.tingkat ?? ""} className={inputClass}>
            <option value="" disabled>Pilih tingkat</option>
            {TINGKAT_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Tahun Ajaran</label>
          <input name="tahunAjaran" type="text" required disabled={isPending} defaultValue={defaultValues?.tahunAjaran} placeholder="2025/2026" className={inputClass} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Deskripsi <span className="text-slate-400 font-normal">(opsional)</span></label>
        <textarea name="deskripsi" disabled={isPending} defaultValue={defaultValues?.deskripsi} placeholder="Deskripsi singkat kelas..." rows={2} className={inputClass + " resize-none"} />
      </div>
      <FormError error={error} />
    </>
  );
}

function CreateForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, action, isPending] = useActionState<ActionResponse<Kelas> | null, FormData>(createKelasAction, null);
  const error = useActionFeedback(state, "Kelas berhasil dibuat.", onSuccess);
  return (
    <form action={action} className="space-y-4">
      <KelasFormFields isPending={isPending} error={error} />
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button type="button" onClick={onSuccess} disabled={isPending} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50">Batal</button>
        <button type="submit" disabled={isPending} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{isPending ? "Menyimpan..." : "Buat Kelas"}</button>
      </div>
    </form>
  );
}

function EditForm({ kelas, onSuccess }: { kelas: Kelas; onSuccess: () => void }) {
  const [state, action, isPending] = useActionState<ActionResponse<Kelas> | null, FormData>(updateKelasAction, null);
  const error = useActionFeedback(state, "Kelas berhasil diperbarui.", onSuccess);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={kelas.id} />
      <KelasFormFields isPending={isPending} error={error} defaultValues={kelas} />
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button type="button" onClick={onSuccess} disabled={isPending} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50">Batal</button>
        <button type="submit" disabled={isPending} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{isPending ? "Menyimpan..." : "Simpan Perubahan"}</button>
      </div>
    </form>
  );
}

export function KelasFormModal() {
  const { modalOpen, selectedKelas, closeModal } = useKelasUIStore();
  if (!modalOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">{selectedKelas ? "Edit Kelas" : "Tambah Kelas"}</h2>
          <button type="button" onClick={closeModal} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"><X size={18} /></button>
        </div>
        <div className="p-6">
          {selectedKelas ? <EditForm kelas={selectedKelas} onSuccess={closeModal} /> : <CreateForm onSuccess={closeModal} />}
        </div>
      </div>
    </div>
  );
}

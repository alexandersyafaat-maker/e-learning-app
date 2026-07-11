"use client";

import { useActionState } from "react";
import { X } from "lucide-react";
import { useTugasUIStore } from "../stores/tugas-ui.store";
import { createTugasAction } from "../actions/create-tugas.action";
import { updateTugasAction } from "../actions/update-tugas.action";
import { LampiranUpload } from "@/components/ui/LampiranUpload";
import { useActionFeedback } from "@/hooks/useActionFeedback";
import { FormError } from "@/components/ui/FormError";
import type { ActionResponse } from "@/lib/types";
import type { Kelas } from "@/features/kelas/types/kelas.types";
import type { Tugas, TugasView } from "../types/tugas.types";

function isoToDateInput(iso?: string): string {
  if (!iso) return "";
  return iso.slice(0, 16);
}

function Fields({
  isPending, error, defaultValues, kelasList,
}: {
  isPending: boolean; error?: string; defaultValues?: TugasView; kelasList: Kelas[];
}) {
  const cls = "w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50";
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Judul Tugas</label>
        <input name="judul" type="text" required disabled={isPending} defaultValue={defaultValues?.judul} placeholder="Judul tugas" className={cls} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Kelas</label>
          <select name="kelasId" required disabled={isPending} defaultValue={defaultValues?.kelasId ?? ""} className={cls}>
            <option value="" disabled>Pilih kelas</option>
            {kelasList.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Deadline <span className="text-slate-400 font-normal">(opsional)</span></label>
          <input name="deadline" type="datetime-local" disabled={isPending} defaultValue={isoToDateInput(defaultValues?.deadline)} className={cls} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Deskripsi / Ketentuan</label>
        <textarea name="deskripsi" required disabled={isPending} defaultValue={defaultValues?.deskripsi} placeholder="Tulis deskripsi atau ketentuan tugas di sini..." rows={7} className={cls + " resize-y"} />
      </div>
      <LampiranUpload existingLampiran={defaultValues?.lampiran} />
      <FormError error={error} />
    </>
  );
}

function Footer({ isPending, onCancel, label }: { isPending: boolean; onCancel: () => void; label: string }) {
  return (
    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
      <button type="button" onClick={onCancel} disabled={isPending} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50">Batal</button>
      <button type="submit" disabled={isPending} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-50">{isPending ? "Menyimpan..." : label}</button>
    </div>
  );
}

function CreateForm({ onSuccess, kelasList }: { onSuccess: () => void; kelasList: Kelas[] }) {
  const [state, action, isPending] = useActionState<ActionResponse<Tugas> | null, FormData>(createTugasAction, null);
  const error = useActionFeedback(state, "Tugas berhasil dibuat.", onSuccess);
  return (
    <form action={action} className="space-y-4 flex flex-col flex-1 min-h-0">
      <div className="space-y-4 overflow-y-auto flex-1 pr-1">
        <Fields isPending={isPending} error={error} kelasList={kelasList} />
      </div>
      <Footer isPending={isPending} onCancel={onSuccess} label="Buat Tugas" />
    </form>
  );
}

function EditForm({ tugas, onSuccess, kelasList }: { tugas: TugasView; onSuccess: () => void; kelasList: Kelas[] }) {
  const [state, action, isPending] = useActionState<ActionResponse<Tugas> | null, FormData>(updateTugasAction, null);
  const error = useActionFeedback(state, "Tugas berhasil diperbarui.", onSuccess);
  return (
    <form action={action} className="space-y-4 flex flex-col flex-1 min-h-0">
      <input type="hidden" name="id" value={tugas.id} />
      <div className="space-y-4 overflow-y-auto flex-1 pr-1">
        <Fields isPending={isPending} error={error} defaultValues={tugas} kelasList={kelasList} />
      </div>
      <Footer isPending={isPending} onCancel={onSuccess} label="Simpan Perubahan" />
    </form>
  );
}

export function TugasFormModal({ kelasList }: { kelasList: Kelas[] }) {
  const { modalOpen, selectedTugas, closeModal } = useTugasUIStore();
  if (!modalOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
          <h2 className="text-base font-semibold text-slate-900">{selectedTugas ? "Edit Tugas" : "Tambah Tugas"}</h2>
          <button type="button" onClick={closeModal} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"><X size={18} /></button>
        </div>
        <div className="p-6 flex flex-col flex-1 min-h-0">
          {selectedTugas
            ? <EditForm tugas={selectedTugas} onSuccess={closeModal} kelasList={kelasList} />
            : <CreateForm onSuccess={closeModal} kelasList={kelasList} />
          }
        </div>
      </div>
    </div>
  );
}

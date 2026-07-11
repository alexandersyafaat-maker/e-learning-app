"use client";

import { useActionState } from "react";
import { X } from "lucide-react";
import { useMateriUIStore } from "../stores/materi-ui.store";
import { createMateriAction } from "../actions/create-materi.action";
import { updateMateriAction } from "../actions/update-materi.action";
import { useActionFeedback } from "@/hooks/useActionFeedback";
import { FormError } from "@/components/ui/FormError";
import type { ActionResponse } from "@/lib/types";
import type { Kelas } from "@/features/kelas/types/kelas.types";
import type { Materi, MateriView } from "../types/materi.types";
import { LampiranUpload } from "@/components/ui/LampiranUpload";

function MateriFields({
  isPending,
  error,
  defaultValues,
  kelasList,
}: {
  isPending: boolean;
  error?: string;
  defaultValues?: MateriView;
  kelasList: Kelas[];
}) {
  const inputClass =
    "w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50";

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Judul Materi</label>
        <input name="judul" type="text" required disabled={isPending} defaultValue={defaultValues?.judul} placeholder="Judul materi" className={inputClass} />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Kelas</label>
        <select name="kelasId" required disabled={isPending} defaultValue={defaultValues?.kelasId ?? ""} className={inputClass}>
          <option value="" disabled>Pilih kelas</option>
          {kelasList.map((k) => (
            <option key={k.id} value={k.id}>{k.nama}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Konten Materi</label>
        <textarea
          name="konten"
          required
          disabled={isPending}
          defaultValue={defaultValues?.konten}
          placeholder="Tulis konten materi di sini..."
          rows={8}
          className={inputClass + " resize-y"}
        />
      </div>
      <LampiranUpload existingLampiran={defaultValues?.lampiran} />
      <FormError error={error} />
    </>
  );
}

function FooterButtons({ isPending, onCancel, label }: { isPending: boolean; onCancel: () => void; label: string }) {
  return (
    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
      <button type="button" onClick={onCancel} disabled={isPending} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50">Batal</button>
      <button type="submit" disabled={isPending} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{isPending ? "Menyimpan..." : label}</button>
    </div>
  );
}

function CreateForm({ onSuccess, kelasList }: { onSuccess: () => void; kelasList: Kelas[] }) {
  const [state, action, isPending] = useActionState<ActionResponse<Materi> | null, FormData>(createMateriAction, null);
  const error = useActionFeedback(state, "Materi berhasil dibuat.", onSuccess);
  return (
    <form action={action} className="space-y-4">
      <MateriFields isPending={isPending} error={error} kelasList={kelasList} />
      <FooterButtons isPending={isPending} onCancel={onSuccess} label="Buat Materi" />
    </form>
  );
}

function EditForm({ materi, onSuccess, kelasList }: { materi: MateriView; onSuccess: () => void; kelasList: Kelas[] }) {
  const [state, action, isPending] = useActionState<ActionResponse<Materi> | null, FormData>(updateMateriAction, null);
  const error = useActionFeedback(state, "Materi berhasil diperbarui.", onSuccess);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={materi.id} />
      <MateriFields isPending={isPending} error={error} defaultValues={materi} kelasList={kelasList} />
      <FooterButtons isPending={isPending} onCancel={onSuccess} label="Simpan Perubahan" />
    </form>
  );
}

export function MateriFormModal({ kelasList }: { kelasList: Kelas[] }) {
  const { modalOpen, selectedMateri, closeModal } = useMateriUIStore();
  if (!modalOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
          <h2 className="text-base font-semibold text-slate-900">{selectedMateri ? "Edit Materi" : "Tambah Materi"}</h2>
          <button type="button" onClick={closeModal} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"><X size={18} /></button>
        </div>
        <div className="p-6 overflow-y-auto">
          {selectedMateri
            ? <EditForm materi={selectedMateri} onSuccess={closeModal} kelasList={kelasList} />
            : <CreateForm onSuccess={closeModal} kelasList={kelasList} />
          }
        </div>
      </div>
    </div>
  );
}

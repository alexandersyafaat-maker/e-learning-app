"use client";

import { useActionState } from "react";
import { X } from "lucide-react";
import { usePertemuanUIStore } from "../stores/pertemuan-ui.store";
import { createPertemuanAction } from "../actions/create-pertemuan.action";
import { useActionFeedback } from "@/hooks/useActionFeedback";
import { FormError } from "@/components/ui/FormError";
import type { ActionResponse } from "@/lib/types";
import type { Kelas } from "@/features/kelas/types/kelas.types";
import type { Pertemuan } from "../types/pertemuan.types";

const DURASI_OPTIONS = [
  { value: 30, label: "30 menit" },
  { value: 45, label: "45 menit" },
  { value: 60, label: "1 jam" },
  { value: 90, label: "1 jam 30 menit" },
  { value: 120, label: "2 jam" },
];

function CreateForm({ onSuccess, kelasList }: { onSuccess: () => void; kelasList: Kelas[] }) {
  const [state, action, isPending] = useActionState<ActionResponse<Pertemuan> | null, FormData>(
    createPertemuanAction,
    null
  );

  const error = useActionFeedback(state, "Pertemuan berhasil dijadwalkan. Link Zoom sudah dibuat.", onSuccess);

  const cls = "w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50";

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Judul Pertemuan</label>
        <input name="judul" type="text" required disabled={isPending} placeholder="Contoh: Diskusi Materi Aljabar Bab 2" className={cls} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Kelas</label>
          <select name="kelasId" required disabled={isPending} defaultValue="" className={cls}>
            <option value="" disabled>Pilih kelas</option>
            {kelasList.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Durasi</label>
          <select name="durasi" required disabled={isPending} defaultValue="60" className={cls}>
            {DURASI_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Jadwal</label>
        <input name="jadwal" type="datetime-local" required disabled={isPending} className={cls} />
      </div>

      <div className="rounded-xl bg-sky-50 border border-sky-200 px-4 py-3 text-sm text-sky-700">
        <p className="font-medium mb-0.5">Zoom Meeting akan dibuat otomatis</p>
        <p className="text-xs text-sky-600">Link bergabung akan langsung tersedia setelah pertemuan dijadwalkan.</p>
      </div>

      <FormError error={error} />

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button type="button" onClick={onSuccess} disabled={isPending} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50">Batal</button>
        <button type="submit" disabled={isPending} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-50">{isPending ? "Menjadwalkan..." : "Jadwalkan"}</button>
      </div>
    </form>
  );
}

export function PertemuanFormModal({ kelasList }: { kelasList: Kelas[] }) {
  const { modalOpen, closeModal } = usePertemuanUIStore();
  if (!modalOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Jadwalkan Pertemuan</h2>
            <p className="text-xs text-slate-500 mt-0.5">Meeting Zoom akan dibuat secara otomatis</p>
          </div>
          <button type="button" onClick={closeModal} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"><X size={18} /></button>
        </div>
        <div className="p-6">
          <CreateForm onSuccess={closeModal} kelasList={kelasList} />
        </div>
      </div>
    </div>
  );
}

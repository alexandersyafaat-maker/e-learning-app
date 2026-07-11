"use client";

import { useTransition } from "react";
import { handleAction } from "@/lib/action-utils";
import { AlertTriangle } from "lucide-react";
import { useKelasUIStore } from "../stores/kelas-ui.store";
import { deleteKelasAction } from "../actions/delete-kelas.action";

export function DeleteKelasDialog() {
  const { deleteTargetId, deleteTargetName, closeDeleteDialog } = useKelasUIStore();
  const [isPending, startTransition] = useTransition();

  if (!deleteTargetId) return null;

  function handleDelete() {
    startTransition(async () => {
      await handleAction(await deleteKelasAction(deleteTargetId!), { successMsg: "Kelas berhasil dihapus.", onSuccess: closeDeleteDialog });
    });
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 mb-1">Hapus Kelas</h2>
            <p className="text-sm text-slate-600">
              Kelas <span className="font-medium text-slate-900">{deleteTargetName}</span> akan dihapus secara permanen.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={closeDeleteDialog} disabled={isPending} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50">Batal</button>
          <button type="button" onClick={handleDelete} disabled={isPending} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{isPending ? "Menghapus..." : "Hapus"}</button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { uploadAvatarAction } from "../actions/upload-avatar.action";
import { useActionFeedback } from "@/hooks/useActionFeedback";
import { FormError } from "@/components/ui/FormError";
import type { ActionResponse } from "@/lib/types";
import type { Session } from "../types/auth.types";

export function AvatarUploadModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [state, action, isPending] = useActionState<ActionResponse<Session> | null, FormData>(
    uploadAvatarAction,
    null
  );

  const handleSuccess = () => {
    router.refresh();
    setPreview(null);
    onClose();
  };

  const error = useActionFeedback(state, "Foto profil berhasil diperbarui.", handleSuccess);

  if (!isOpen) return null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPreview(null);
      return;
    }
    setPreview(URL.createObjectURL(file));
  }

  function handleClose() {
    setPreview(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">Ganti Foto Profil</h2>
          <button type="button" onClick={handleClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
            <X size={18} />
          </button>
        </div>
        <form action={action} className="p-6 space-y-4">
          <div className="flex justify-center">
            {preview ? (
              <img src={preview} alt="Preview foto profil" className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                Belum ada foto
              </div>
            )}
          </div>
          <input
            type="file"
            name="foto"
            accept="image/jpeg,image/png,image/gif,image/webp"
            required
            disabled={isPending}
            onChange={handleFileChange}
            className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          <FormError error={error} />
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Mengupload..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

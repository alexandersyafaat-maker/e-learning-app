"use client";

import { useState, useEffect } from "react";
import { X, FileText } from "lucide-react";
import { toast } from "sonner";
import { useNilaiUIStore } from "../stores/nilai-ui.store";
import { updateHasilLatihanNilaiAction } from "../actions/update-hasil-latihan-nilai.action";
import { updateSubmisiTugasNilaiAction } from "../actions/update-submisi-tugas-nilai.action";
import { FormError } from "@/components/ui/FormError";
import { LampiranList } from "@/components/ui/LampiranList";
import { formatDateShort } from "@/lib/utils";

export function NilaiBeriModal() {
  const { modalTarget, closeModal } = useNilaiUIStore();
  const [nilaiInput, setNilaiInput] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (modalTarget) {
      setNilaiInput(
        modalTarget.item.nilai !== undefined ? String(modalTarget.item.nilai) : ""
      );
      setError(undefined);
    }
  }, [modalTarget]);

  if (!modalTarget) return null;

  const { type, item } = modalTarget;
  const judul = type === "latihan" ? item.latihanJudul : item.tugasJudul;
  const existingNilai = item.nilai;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseInt(nilaiInput, 10);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      setError("Nilai harus bilangan bulat antara 0–100.");
      return;
    }
    setIsPending(true);
    setError(undefined);

    let result;
    if (type === "latihan") {
      result = await updateHasilLatihanNilaiAction(item.latihanId, item.id, { nilai: parsed });
    } else {
      result = await updateSubmisiTugasNilaiAction(item.tugasId, item.id, { nilai: parsed });
    }

    setIsPending(false);
    if (!result.success) {
      setError(result.error);
    } else {
      toast.success("Nilai berhasil disimpan.");
      closeModal();
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {existingNilai !== undefined ? "Ubah Nilai" : "Beri Nilai"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{item.siswaNama}</p>
          </div>
          <button
            type="button"
            onClick={closeModal}
            disabled={isPending}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {type === "latihan" ? "Latihan" : "Tugas"}
            </p>
            <p className="text-sm font-medium text-slate-800">{judul}</p>
            <p className="text-xs text-slate-400">
              Dikumpulkan: {formatDateShort(item.submittedAt)}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <FileText size={13} className="text-slate-400" />
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Jawaban Siswa</p>
            </div>
            <div className="bg-slate-50 rounded-lg border border-slate-200 px-3.5 py-3 max-h-36 overflow-y-auto">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{item.jawaban}</p>
            </div>
          </div>

          {type === "tugas" && item.catatan && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Catatan Siswa</p>
              <div className="bg-slate-50 rounded-lg border border-slate-200 px-3.5 py-3">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{item.catatan}</p>
              </div>
            </div>
          )}

          {item.lampiran.length > 0 && (
            <LampiranList lampiran={item.lampiran} label="File yang Dikumpulkan Siswa" />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Nilai <span className="text-slate-400 font-normal">(0–100)</span>
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                required
                value={nilaiInput}
                onChange={(e) => setNilaiInput(e.target.value)}
                disabled={isPending}
                placeholder="Contoh: 85"
                className="w-32 px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
              />
            </div>

            <FormError error={error} />

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={closeModal}
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
                {isPending ? "Menyimpan..." : "Simpan Nilai"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useActionState, useState } from "react";
import { X } from "lucide-react";
import { useAkunUIStore } from "../stores/akun-ui.store";
import { createAkunAction } from "../actions/create-akun.action";
import { updateAkunAction } from "../actions/update-akun.action";
import { Role } from "@/features/auth/types/auth.types";
import { useActionFeedback } from "@/hooks/useActionFeedback";
import { FormError } from "@/components/ui/FormError";
import type { ActionResponse } from "@/lib/types";
import type { Akun } from "../types/akun.types";
import type { Kelas } from "@/features/kelas/types/kelas.types";

const ROLE_OPTIONS = [
  { value: Role.ADMIN, label: "Administrator" },
  { value: Role.GURU, label: "Guru" },
  { value: Role.SISWA, label: "Siswa" },
];

const inputClass =
  "w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50";
const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

function FormFields({
  isPending,
  error,
  defaultValues,
  isEdit = false,
  kelasList,
}: {
  isPending: boolean;
  error?: string;
  defaultValues?: Akun;
  isEdit?: boolean;
  kelasList: Kelas[];
}) {
  const [role, setRole] = useState<string>(defaultValues?.role ?? Role.SISWA);

  return (
    <>
      <div>
        <label className={labelClass}>Nama Lengkap</label>
        <input
          name="name"
          type="text"
          required
          disabled={isPending}
          defaultValue={defaultValues?.name}
          placeholder="Nama lengkap"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Email</label>
        <input
          name="email"
          type="email"
          required
          disabled={isPending}
          defaultValue={defaultValues?.email}
          placeholder="email@contoh.com"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>
          Password{" "}
          {isEdit && <span className="text-slate-400 font-normal">(kosongkan jika tidak diubah)</span>}
        </label>
        <input
          name="password"
          type="password"
          required={!isEdit}
          disabled={isPending}
          placeholder={isEdit ? "••••••••" : "Minimal 6 karakter"}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Role</label>
        <select
          name="role"
          required
          disabled={isPending}
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className={`${inputClass} bg-white`}
        >
          <option value="" disabled>Pilih role</option>
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {role === Role.SISWA && (
        <>
          <div>
            <label className={labelClass}>NISN</label>
            <input
              name="nisn"
              type="text"
              inputMode="numeric"
              pattern="\d{10}"
              maxLength={10}
              required
              disabled={isPending}
              defaultValue={defaultValues?.nisn}
              placeholder="10 digit angka"
              className={inputClass}
            />
            <p className="text-xs text-slate-400 mt-1">Nomor Induk Siswa Nasional — 10 digit. Digunakan untuk login.</p>
          </div>
          <div>
            <label className={labelClass}>Kelas</label>
            <select
              name="kelasId"
              disabled={isPending}
              defaultValue={defaultValues?.kelasId ?? ""}
              className={`${inputClass} bg-white`}
            >
              <option value="">Belum ditentukan</option>
              {kelasList.map((k) => (
                <option key={k.id} value={k.id}>{k.nama}</option>
              ))}
            </select>
          </div>
        </>
      )}

      {role === Role.GURU && (
        <div>
          <label className={labelClass}>NIK</label>
          <input
            name="nik"
            type="text"
            inputMode="numeric"
            pattern="\d{16}"
            maxLength={16}
            required
            disabled={isPending}
            defaultValue={defaultValues?.nik}
            placeholder="16 digit angka"
            className={inputClass}
          />
          <p className="text-xs text-slate-400 mt-1">Nomor Induk Kependudukan — 16 digit. Digunakan untuk login.</p>
        </div>
      )}

      <FormError error={error} />
    </>
  );
}

function ModalFooter({
  isPending,
  onCancel,
  label,
}: {
  isPending: boolean;
  onCancel: () => void;
  label: string;
}) {
  return (
    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
      <button
        type="button"
        onClick={onCancel}
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
        {isPending ? "Menyimpan..." : label}
      </button>
    </div>
  );
}

function CreateForm({ onSuccess, kelasList }: { onSuccess: () => void; kelasList: Kelas[] }) {
  const [state, action, isPending] = useActionState<ActionResponse<Akun> | null, FormData>(
    createAkunAction,
    null
  );
  const error = useActionFeedback(state, "Akun berhasil dibuat.", onSuccess);

  return (
    <form action={action} className="space-y-4">
      <FormFields isPending={isPending} error={error} kelasList={kelasList} />
      <ModalFooter isPending={isPending} onCancel={onSuccess} label="Buat Akun" />
    </form>
  );
}

function EditForm({ akun, onSuccess, kelasList }: { akun: Akun; onSuccess: () => void; kelasList: Kelas[] }) {
  const [state, action, isPending] = useActionState<ActionResponse<Akun> | null, FormData>(
    updateAkunAction,
    null
  );
  const error = useActionFeedback(state, "Akun berhasil diperbarui.", onSuccess);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={akun.id} />
      <FormFields isPending={isPending} error={error} defaultValues={akun} isEdit kelasList={kelasList} />
      <ModalFooter isPending={isPending} onCancel={onSuccess} label="Simpan Perubahan" />
    </form>
  );
}

export function AkunFormModal({ kelasList }: { kelasList: Kelas[] }) {
  const { modalOpen, selectedAkun, closeModal } = useAkunUIStore();

  if (!modalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
          <h2 className="text-base font-semibold text-slate-900">
            {selectedAkun ? "Edit Akun" : "Tambah Akun"}
          </h2>
          <button
            type="button"
            onClick={closeModal}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {selectedAkun ? (
            <EditForm akun={selectedAkun} onSuccess={closeModal} kelasList={kelasList} />
          ) : (
            <CreateForm onSuccess={closeModal} kelasList={kelasList} />
          )}
        </div>
      </div>
    </div>
  );
}

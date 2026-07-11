"use client";

import { useActionState, useState } from "react";
import { FormError } from "@/components/ui/FormError";
import { Eye, EyeOff } from "lucide-react";
import { registerAction } from "../actions/register.action";
import type { ActionResponse } from "@/lib/types";
import type { Kelas } from "@/features/kelas/types/kelas.types";

interface RegisterFormProps {
  kelasList: Kelas[];
  onSwitchToLogin: () => void;
}

export function RegisterForm({ kelasList, onSwitchToLogin }: RegisterFormProps) {
  const [state, action, isPending] = useActionState<
    ActionResponse<never> | null,
    FormData
  >(registerAction, null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [role, setRole] = useState("SISWA");

  const inputClass =
    "w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="reg-name" className={labelClass}>
          Nama Lengkap
        </label>
        <input
          id="reg-name"
          name="name"
          type="text"
          required
          disabled={isPending}
          autoComplete="name"
          placeholder="Nama lengkap Anda"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="reg-email" className={labelClass}>
          Email
        </label>
        <input
          id="reg-email"
          name="email"
          type="email"
          required
          disabled={isPending}
          autoComplete="email"
          placeholder="email@contoh.com"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="reg-role" className={labelClass}>
          Daftar sebagai
        </label>
        <select
          id="reg-role"
          name="role"
          required
          disabled={isPending}
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className={`${inputClass} bg-white`}
        >
          <option value="SISWA">Siswa</option>
          <option value="GURU">Guru</option>
        </select>
      </div>

      {role === "SISWA" && (
        <>
          <div>
            <label htmlFor="reg-nisn" className={labelClass}>
              NISN
            </label>
            <input
              id="reg-nisn"
              name="nisn"
              type="text"
              inputMode="numeric"
              pattern="\d{10}"
              maxLength={10}
              required
              disabled={isPending}
              placeholder="10 digit angka"
              className={inputClass}
            />
            <p className="text-xs text-slate-400 mt-1">Nomor Induk Siswa Nasional — digunakan untuk login.</p>
          </div>
          <div>
            <label htmlFor="reg-kelas" className={labelClass}>
              Kelas
            </label>
            <select
              id="reg-kelas"
              name="kelasId"
              required
              disabled={isPending}
              defaultValue=""
              className={`${inputClass} bg-white`}
            >
              <option value="" disabled>
                Pilih kelas Anda
              </option>
              {kelasList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {role === "GURU" && (
        <div>
          <label htmlFor="reg-nik" className={labelClass}>
            NIK
          </label>
          <input
            id="reg-nik"
            name="nik"
            type="text"
            inputMode="numeric"
            pattern="\d{16}"
            maxLength={16}
            required
            disabled={isPending}
            placeholder="16 digit angka"
            className={inputClass}
          />
          <p className="text-xs text-slate-400 mt-1">Nomor Induk Kependudukan — digunakan untuk login.</p>
        </div>
      )}

      <div>
        <label htmlFor="reg-password" className={labelClass}>
          Password
        </label>
        <div className="relative">
          <input
            id="reg-password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            disabled={isPending}
            autoComplete="new-password"
            placeholder="Minimal 6 karakter"
            className={`${inputClass} pr-10`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="reg-confirm" className={labelClass}>
          Konfirmasi Password
        </label>
        <div className="relative">
          <input
            id="reg-confirm"
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            required
            disabled={isPending}
            autoComplete="new-password"
            placeholder="Ulangi password"
            className={`${inputClass} pr-10`}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <FormError error={state?.success === false ? state.error : undefined} />

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
      >
        {isPending ? "Mendaftar..." : "Buat Akun"}
      </button>

      <p className="text-center text-sm text-slate-500">
        Sudah punya akun?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-indigo-600 font-medium hover:underline"
        >
          Masuk di sini
        </button>
      </p>
    </form>
  );
}

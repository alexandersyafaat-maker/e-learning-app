"use client";

import { useActionState } from "react";
import { FormError } from "@/components/ui/FormError";
import { loginAction } from "../actions/login.action";
import type { ActionResponse } from "@/lib/types";

interface LoginFormProps {
  onSwitchToRegister?: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [state, action, isPending] = useActionState<
    ActionResponse<never> | null,
    FormData
  >(loginAction, null);

  const inputClass =
    "w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50";

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="identifier" className="block text-sm font-medium text-slate-700 mb-1.5">
          NISN / NIK / Email
        </label>
        <input
          id="identifier"
          name="identifier"
          type="text"
          required
          disabled={isPending}
          autoComplete="username"
          placeholder="Masukkan NISN, NIK, atau Email"
          className={inputClass}
        />
        <p className="text-xs text-slate-400 mt-1">Siswa: NISN · Guru: NIK · Admin: Email</p>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          disabled={isPending}
          autoComplete="current-password"
          placeholder="••••••••"
          className={inputClass}
        />
      </div>

      <FormError error={state?.success === false ? state.error : undefined} />

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
      >
        {isPending ? "Memproses..." : "Masuk"}
      </button>

      {onSwitchToRegister && (
        <p className="text-center text-sm text-slate-500">
          Belum punya akun?{" "}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-indigo-600 font-medium hover:underline"
          >
            Daftar sekarang
          </button>
        </p>
      )}
    </form>
  );
}

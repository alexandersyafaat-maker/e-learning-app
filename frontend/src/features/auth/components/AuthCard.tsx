"use client";

import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import type { Kelas } from "@/features/kelas/types/kelas.types";

type AuthMode = "login" | "register";

interface AuthCardProps {
  kelasList: Kelas[];
}

export function AuthCard({ kelasList }: AuthCardProps) {
  const [mode, setMode] = useState<AuthMode>("login");

  return (
    <>
      {/* Tabs */}
      <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
            mode === "login"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Masuk
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
            mode === "register"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Daftar
        </button>
      </div>

      {mode === "login" ? (
        <LoginForm onSwitchToRegister={() => setMode("register")} />
      ) : (
        <RegisterForm kelasList={kelasList} onSwitchToLogin={() => setMode("login")} />
      )}
    </>
  );
}

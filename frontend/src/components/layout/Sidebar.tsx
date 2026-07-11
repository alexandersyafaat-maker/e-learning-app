"use client";

import { useEffect } from "react";
import { useUIStore } from "@/stores/ui.store";
import { SidebarNav } from "./SidebarNav";
import { logoutAction } from "@/features/auth/actions/logout.action";
import { Role, type Session } from "@/features/auth/types/auth.types";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const ROLE_LABEL: Record<Role, string> = {
  [Role.ADMIN]: "Administrator",
  [Role.GURU]: "Guru",
  [Role.SISWA]: "Siswa",
};

export function Sidebar({ session }: { session: Session }) {
  const { sidebarOpen, closeSidebar } = useUIStore();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    closeSidebar();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 flex flex-col transition-transform duration-200 ease-in-out",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-700 shrink-0">
          <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-lg shrink-0">
            <span className="text-white text-sm font-bold">E</span>
          </div>
          <span className="text-white font-semibold text-sm">E-Learning App</span>
        </div>

        {/* Nav */}
        <SidebarNav role={session.role} />

        {/* User info + logout */}
        <div className="px-3 pb-4 shrink-0 border-t border-slate-700">
          <div className="flex items-center gap-3 px-3 py-3 mt-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shrink-0 overflow-hidden">
              {session.avatarUrl ? (
                <img src={session.avatarUrl} alt={session.name} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <span className="text-white text-xs font-semibold">
                  {getInitials(session.name)}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {session.name}
              </p>
              <p className="text-slate-400 text-xs truncate font-mono">
                {session.role === Role.SISWA
                  ? (session.nisn ?? session.email)
                  : session.role === Role.GURU
                  ? (session.nik ?? session.email)
                  : session.email}
              </p>
            </div>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <LogOut size={18} className="shrink-0" />
              Keluar
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

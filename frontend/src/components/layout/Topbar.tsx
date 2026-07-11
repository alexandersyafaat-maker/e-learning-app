"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, Camera, LogOut } from "lucide-react";
import { useUIStore } from "@/stores/ui.store";
import { Role, type Session } from "@/features/auth/types/auth.types";
import { logoutAction } from "@/features/auth/actions/logout.action";
import { AvatarUploadModal } from "@/features/auth/components/AvatarUploadModal";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Topbar({ session }: { session: Session }) {
  const { toggleSidebar } = useUIStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-10 shrink-0">
      <button
        type="button"
        onClick={toggleSidebar}
        className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 lg:hidden"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Spacer on desktop since sidebar takes left space */}
      <div className="hidden lg:block" />

      <div className="relative flex items-center gap-3" ref={menuRef}>
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-slate-900 leading-none">
            {session.name}
          </p>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">
            {session.role === Role.SISWA
              ? (session.nisn ?? session.email)
              : session.role === Role.GURU
              ? (session.nik ?? session.email)
              : session.email}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shrink-0 overflow-hidden"
          aria-label="Menu profil"
        >
          {session.avatarUrl ? (
            <img src={session.avatarUrl} alt={session.name} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <span className="text-white text-xs font-semibold">
              {getInitials(session.name)}
            </span>
          )}
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-20">
            <button
              type="button"
              onClick={() => {
                setModalOpen(true);
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Camera size={16} className="shrink-0" />
              Ganti Foto Profil
            </button>
            <form action={logoutAction}>
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <LogOut size={16} className="shrink-0" />
                Logout
              </button>
            </form>
          </div>
        )}
      </div>

      <AvatarUploadModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </header>
  );
}

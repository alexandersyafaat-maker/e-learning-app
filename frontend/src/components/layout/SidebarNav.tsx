"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  FileText,
  Star,
  Video,
  BookMarked,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Role } from "@/features/auth/types/auth.types";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: Record<Role, NavItem[]> = {
  [Role.ADMIN]: [
    { href: "/admin/akun", label: "Kelola Akun", icon: Users },
    { href: "/admin/kelas", label: "Kelola Kelas", icon: GraduationCap },
  ],
  [Role.GURU]: [
    { href: "/guru/materi", label: "Kelola Materi", icon: BookOpen },
    { href: "/guru/latihan", label: "Kelola Latihan", icon: ClipboardList },
    { href: "/guru/tugas", label: "Kelola Tugas", icon: FileText },
    { href: "/guru/pertemuan", label: "Pertemuan", icon: Video },
    { href: "/guru/vocab", label: "Kelola Kosakata", icon: BookMarked },
    { href: "/guru/nilai", label: "Kelola Nilai", icon: Star },
  ],
  [Role.SISWA]: [
    { href: "/siswa/materi", label: "Materi", icon: BookOpen },
    { href: "/siswa/latihan", label: "Latihan", icon: ClipboardList },
    { href: "/siswa/tugas", label: "Tugas", icon: FileText },
    { href: "/siswa/pertemuan", label: "Pertemuan", icon: Video },
    { href: "/siswa/vocab", label: "Review Vocab", icon: BookMarked },
    { href: "/siswa/nilai", label: "Nilai Saya", icon: Star },
  ],
};

export function SidebarNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role] ?? [];

  return (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto flex flex-col">
      <div className="flex-1 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-indigo-600 text-white font-medium"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              )}
            >
              <Icon size={18} className="shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </div>
      <div className="pt-3 border-t border-slate-700 mt-3">
        <Link
          href="/api/logout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-red-900/40 hover:text-red-300 transition-colors"
        >
          <LogOut size={18} className="shrink-0" />
          Keluar
        </Link>
      </div>
    </nav>
  );
}

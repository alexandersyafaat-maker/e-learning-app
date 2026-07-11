"use client";

import { useState } from "react";
import { Pencil, Trash2, Search, Plus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAkunUIStore } from "../stores/akun-ui.store";
import type { Akun } from "../types/akun.types";
import { Role } from "@/features/auth/types/auth.types";

const ROLE_BADGE: Record<Role, { label: string; variant: "indigo" | "emerald" | "sky" }> = {
  [Role.ADMIN]: { label: "Admin", variant: "indigo" },
  [Role.GURU]: { label: "Guru", variant: "emerald" },
  [Role.SISWA]: { label: "Siswa", variant: "sky" },
};

export function AkunTable({ akunList }: { akunList: Akun[] }) {
  const [search, setSearch] = useState("");
  const { openCreateModal, openEditModal, openDeleteDialog } = useAkunUIStore();

  const filtered = akunList.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shrink-0"
        >
          <Plus size={16} />
          Tambah Akun
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title={search ? "Tidak ada hasil pencarian" : "Belum ada akun"}
            description={
              search
                ? `Tidak ditemukan akun dengan kata kunci "${search}".`
                : "Klik tombol Tambah Akun untuk menambahkan akun pertama."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-12">
                    No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    NISN / NIK
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((akun, i) => {
                  const roleBadge = ROLE_BADGE[akun.role];
                  return (
                    <tr key={akun.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-500">{i + 1}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {akun.name}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{akun.email}</td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                        {akun.role === Role.SISWA && akun.nisn
                          ? akun.nisn
                          : akun.role === Role.GURU && akun.nik
                          ? akun.nik
                          : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={roleBadge.variant}>
                          {roleBadge.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(akun)}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                            aria-label="Edit akun"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              openDeleteDialog(akun.id, akun.name)
                            }
                            className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
                            aria-label="Hapus akun"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 mt-3">
        Menampilkan {filtered.length} dari {akunList.length} akun
      </p>
    </div>
  );
}

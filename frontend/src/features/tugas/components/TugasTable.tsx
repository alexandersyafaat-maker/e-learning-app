"use client";

import { useState } from "react";
import { Pencil, Trash2, Search, Plus, BookMarked, Paperclip, Calendar, Eye } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useTugasUIStore } from "../stores/tugas-ui.store";
import type { TugasView } from "../types/tugas.types";

function formatDeadline(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function isOverdue(iso?: string) {
  if (!iso) return false;
  return new Date(iso) < new Date();
}

export function TugasTable({ tugasList }: { tugasList: TugasView[] }) {
  const [search, setSearch] = useState("");
  const { openCreateModal, openEditModal, openDeleteDialog } = useTugasUIStore();

  const filtered = tugasList.filter(
    (t) =>
      t.judul.toLowerCase().includes(search.toLowerCase()) ||
      t.kelasNama.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari judul atau kelas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shrink-0"
        >
          <Plus size={16} />
          Tambah Tugas
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {filtered.length === 0 ? (
          <EmptyState
            icon={BookMarked}
            title={search ? "Tidak ada hasil" : "Belum ada tugas"}
            description={search ? `Tidak ditemukan tugas "${search}".` : "Klik Tambah Tugas untuk membuat tugas pertama."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-12">No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Judul</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kelas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Deadline</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Lampiran</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((t, i) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-500">{i + 1}</td>
                    <td className="px-6 py-4 font-medium text-slate-900 max-w-xs"><p className="truncate">{t.judul}</p></td>
                    <td className="px-6 py-4"><Badge variant="amber">{t.kelasNama}</Badge></td>
                    <td className="px-6 py-4">
                      {t.deadline ? (
                        <span className={`flex items-center gap-1 text-xs ${isOverdue(t.deadline) ? "text-red-500" : "text-slate-500"}`}>
                          <Calendar size={12} />
                          {formatDeadline(t.deadline)}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {t.lampiran.length > 0 ? (
                        <span className="flex items-center gap-1 text-xs text-slate-500"><Paperclip size={12} />{t.lampiran.length}</span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/guru/tugas/${t.id}`} className="p-2 rounded-lg hover:bg-amber-50 text-slate-500 hover:text-amber-600 transition-colors" title="Lihat detail"><Eye size={15} /></Link>
                        <button type="button" onClick={() => openEditModal(t)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"><Pencil size={15} /></button>
                        <button type="button" onClick={() => openDeleteDialog(t.id, t.judul)} className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="text-xs text-slate-400 mt-3">Menampilkan {filtered.length} dari {tugasList.length} tugas</p>
    </div>
  );
}

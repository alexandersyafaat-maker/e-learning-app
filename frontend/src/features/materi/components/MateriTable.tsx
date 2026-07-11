"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Search, Plus, BookOpen, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useMateriUIStore } from "../stores/materi-ui.store";
import type { MateriView } from "../types/materi.types";

export function MateriTable({ materiList }: { materiList: MateriView[] }) {
  const [search, setSearch] = useState("");
  const { openCreateModal, openEditModal, openDeleteDialog } = useMateriUIStore();

  const filtered = materiList.filter(
    (m) =>
      m.judul.toLowerCase().includes(search.toLowerCase()) ||
      m.kelasNama.toLowerCase().includes(search.toLowerCase())
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
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shrink-0"
        >
          <Plus size={16} />
          Tambah Materi
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {filtered.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={search ? "Tidak ada hasil" : "Belum ada materi"}
            description={
              search
                ? `Tidak ditemukan materi dengan kata kunci "${search}".`
                : "Klik tombol Tambah Materi untuk membuat materi pertama."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-12">No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Judul Materi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kelas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Konten</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((materi, i) => (
                  <tr key={materi.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-500">{i + 1}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{materi.judul}</td>
                    <td className="px-6 py-4">
                      <Badge variant="indigo">{materi.kelasNama}</Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs">
                      <p className="truncate">{materi.konten.slice(0, 60)}...</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/guru/materi/${materi.id}`}
                          className="p-2 rounded-lg hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition-colors"
                          title="Lihat obrolan"
                        >
                          <MessageSquare size={15} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEditModal(materi)}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteDialog(materi.id, materi.judul)}
                          className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="text-xs text-slate-400 mt-3">
        Menampilkan {filtered.length} dari {materiList.length} materi
      </p>
    </div>
  );
}

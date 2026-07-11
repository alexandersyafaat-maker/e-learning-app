"use client";

import { useState } from "react";
import { Pencil, Trash2, Search, Plus } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { useKelasUIStore } from "../stores/kelas-ui.store";
import type { Kelas } from "../types/kelas.types";

export function KelasTable({ kelasList }: { kelasList: Kelas[] }) {
  const [search, setSearch] = useState("");
  const { openCreateModal, openEditModal, openDeleteDialog } = useKelasUIStore();

  const filtered = kelasList.filter(
    (k) =>
      k.nama.toLowerCase().includes(search.toLowerCase()) ||
      k.tingkat.toLowerCase().includes(search.toLowerCase()) ||
      k.tahunAjaran.includes(search)
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama atau tingkat kelas..."
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
          Tambah Kelas
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title={search ? "Tidak ada hasil pencarian" : "Belum ada kelas"}
            description={
              search
                ? `Tidak ditemukan kelas dengan kata kunci "${search}".`
                : "Klik tombol Tambah Kelas untuk menambahkan kelas pertama."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-12">No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama Kelas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tingkat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tahun Ajaran</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Deskripsi</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((kelas, i) => (
                  <tr key={kelas.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-500">{i + 1}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{kelas.nama}</td>
                    <td className="px-6 py-4 text-slate-600">{kelas.tingkat}</td>
                    <td className="px-6 py-4 text-slate-600">{kelas.tahunAjaran}</td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{kelas.deskripsi ?? "-"}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(kelas)}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteDialog(kelas.id, kelas.nama)}
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
        Menampilkan {filtered.length} dari {kelasList.length} kelas
      </p>
    </div>
  );
}

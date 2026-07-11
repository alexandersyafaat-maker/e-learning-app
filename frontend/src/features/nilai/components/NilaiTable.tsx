"use client";

import { useState } from "react";
import { Search, ClipboardList, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { NilaiBadge } from "./NilaiBadge";
import { useNilaiUIStore } from "../stores/nilai-ui.store";
import type { HasilLatihanNilai, SubmisiTugasNilai } from "../types/nilai.types";
import { formatDateShort } from "@/lib/utils";

interface NilaiTableProps {
  hasilLatihan: HasilLatihanNilai[];
  submisiTugas: SubmisiTugasNilai[];
}

function LatihanTab({ data }: { data: HasilLatihanNilai[] }) {
  const [search, setSearch] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
  const { openModal } = useNilaiUIStore();

  const kelasList = Array.from(new Set(data.map((d) => d.kelasNama))).sort();

  const filtered = data.filter((d) => {
    const matchSearch =
      d.siswaNama.toLowerCase().includes(search.toLowerCase()) ||
      d.latihanJudul.toLowerCase().includes(search.toLowerCase());
    const matchKelas = !filterKelas || d.kelasNama === filterKelas;
    return matchSearch && matchKelas;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama siswa atau judul latihan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        {kelasList.length > 1 && (
          <select
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
            className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          >
            <option value="">Semua Kelas</option>
            {kelasList.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {filtered.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Tidak ada data"
            description="Belum ada siswa yang mengumpulkan latihan."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-10">No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama Siswa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Judul Latihan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kelas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tgl Kumpul</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Lampiran</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nilai</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item, i) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-500">{i + 1}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{item.siswaNama}</div>
                      <div className="text-xs text-slate-400">{item.siswaEmail}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{item.latihanJudul}</td>
                    <td className="px-6 py-4">
                      <Badge variant="indigo">{item.kelasNama}</Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{formatDateShort(item.submittedAt)}</td>
                    <td className="px-6 py-4">
                      {item.lampiran.length > 0 ? (
                        <span className="flex items-center gap-1 text-xs text-slate-500"><Paperclip size={12} />{item.lampiran.length}</span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <NilaiBadge nilai={item.nilai} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => openModal({ type: "latihan", item })}
                        className="text-xs px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium transition-colors"
                      >
                        {item.nilai !== undefined ? "Ubah Nilai" : "Beri Nilai"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="text-xs text-slate-400">Menampilkan {filtered.length} dari {data.length} submisi</p>
    </div>
  );
}

function TugasTab({ data }: { data: SubmisiTugasNilai[] }) {
  const [search, setSearch] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
  const { openModal } = useNilaiUIStore();

  const kelasList = Array.from(new Set(data.map((d) => d.kelasNama))).sort();

  const filtered = data.filter((d) => {
    const matchSearch =
      d.siswaNama.toLowerCase().includes(search.toLowerCase()) ||
      d.tugasJudul.toLowerCase().includes(search.toLowerCase());
    const matchKelas = !filterKelas || d.kelasNama === filterKelas;
    return matchSearch && matchKelas;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama siswa atau judul tugas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        {kelasList.length > 1 && (
          <select
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
            className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          >
            <option value="">Semua Kelas</option>
            {kelasList.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {filtered.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Tidak ada data"
            description="Belum ada siswa yang mengumpulkan tugas."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-10">No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama Siswa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Judul Tugas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kelas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tgl Kumpul</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Lampiran</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nilai</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item, i) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-500">{i + 1}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{item.siswaNama}</div>
                      <div className="text-xs text-slate-400">{item.siswaEmail}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{item.tugasJudul}</td>
                    <td className="px-6 py-4">
                      <Badge variant="indigo">{item.kelasNama}</Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{formatDateShort(item.submittedAt)}</td>
                    <td className="px-6 py-4">
                      {item.lampiran.length > 0 ? (
                        <span className="flex items-center gap-1 text-xs text-slate-500"><Paperclip size={12} />{item.lampiran.length}</span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <NilaiBadge nilai={item.nilai} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => openModal({ type: "tugas", item })}
                        className="text-xs px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium transition-colors"
                      >
                        {item.nilai !== undefined ? "Ubah Nilai" : "Beri Nilai"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="text-xs text-slate-400">Menampilkan {filtered.length} dari {data.length} submisi</p>
    </div>
  );
}

export function NilaiTable({ hasilLatihan, submisiTugas }: NilaiTableProps) {
  const { activeTab, setActiveTab } = useNilaiUIStore();

  return (
    <div>
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("latihan")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "latihan"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Nilai Latihan
          <span className="ml-2 text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">
            {hasilLatihan.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("tugas")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "tugas"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Nilai Tugas
          <span className="ml-2 text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">
            {submisiTugas.length}
          </span>
        </button>
      </div>

      {activeTab === "latihan" ? (
        <LatihanTab data={hasilLatihan} />
      ) : (
        <TugasTab data={submisiTugas} />
      )}
    </div>
  );
}

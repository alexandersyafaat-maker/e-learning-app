"use client";

import { Printer, ClipboardList } from "lucide-react";
import { NilaiBadge } from "./NilaiBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import type { NilaiSiswa } from "../types/nilai.types";
import { formatDateShort } from "@/lib/utils";

interface NilaiSiswaTableProps {
  data: NilaiSiswa;
  namaSiswa: string;
}

function avg(values: (number | undefined)[]): string {
  const defined = values.filter((v): v is number => v !== undefined);
  if (defined.length === 0) return "—";
  return (defined.reduce((a, b) => a + b, 0) / defined.length).toFixed(1);
}

export function NilaiSiswaTable({ data, namaSiswa }: NilaiSiswaTableProps) {
  const rataLatihan = avg(data.latihan.map((h) => h.nilai));
  const rataTugas = avg(data.tugas.map((s) => s.nilai));

  return (
    <div className="space-y-6 print:hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nilai Saya</h1>
          <p className="text-sm text-slate-500 mt-1">
            Rekap nilai latihan dan tugas, {namaSiswa}.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Printer size={15} />
          Download PDF
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">Nilai Latihan</h2>
          {rataLatihan !== "—" && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              Rata-rata:
              <NilaiBadge nilai={parseFloat(rataLatihan)} />
            </div>
          )}
        </div>
        {data.latihan.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Belum ada latihan"
            description="Nilai latihan akan muncul setelah guru memberi penilaian."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-10">No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Judul Latihan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tgl Kumpul</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nilai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.latihan.map((item, i) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-500">{i + 1}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{item.latihanJudul}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{formatDateShort(item.submittedAt)}</td>
                    <td className="px-6 py-4">
                      <NilaiBadge nilai={item.nilai} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">Nilai Tugas</h2>
          {rataTugas !== "—" && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              Rata-rata:
              <NilaiBadge nilai={parseFloat(rataTugas)} />
            </div>
          )}
        </div>
        {data.tugas.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Belum ada tugas"
            description="Nilai tugas akan muncul setelah guru memberi penilaian."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-10">No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Judul Tugas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tgl Kumpul</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nilai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.tugas.map((item, i) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-500">{i + 1}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{item.tugasJudul}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{formatDateShort(item.submittedAt)}</td>
                    <td className="px-6 py-4">
                      <NilaiBadge nilai={item.nilai} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400">
        * &ldquo;Belum dinilai&rdquo; = nilai belum dimasukkan guru.
      </p>
    </div>
  );
}

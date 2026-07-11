import type { NilaiSiswa } from "../types/nilai.types";
import { formatDateShort } from "@/lib/utils";

interface NilaiPrintViewProps {
  data: NilaiSiswa;
  namaSiswa: string;
}

function avg(values: (number | undefined)[]): string {
  const defined = values.filter((v): v is number => v !== undefined);
  if (defined.length === 0) return "—";
  return (defined.reduce((a, b) => a + b, 0) / defined.length).toFixed(1);
}

export function NilaiPrintView({ data, namaSiswa }: NilaiPrintViewProps) {
  const today = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="hidden print:block p-8 font-sans text-sm text-black">
      <div className="mb-6 border-b-2 border-black pb-4">
        <h1 className="text-xl font-bold">Rekap Nilai</h1>
        <p className="text-sm mt-1">Nama: {namaSiswa}</p>
        <p className="text-sm">Tanggal Cetak: {today}</p>
      </div>

      <div className="mb-6">
        <h2 className="font-bold text-base mb-2">Nilai Latihan</h2>
        {data.latihan.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Belum ada latihan yang dikumpulkan.</p>
        ) : (
          <>
            <table className="w-full border-collapse border border-black text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black px-3 py-1 text-left w-8">No</th>
                  <th className="border border-black px-3 py-1 text-left">Judul Latihan</th>
                  <th className="border border-black px-3 py-1 text-left">Tgl Kumpul</th>
                  <th className="border border-black px-3 py-1 text-center w-16">Nilai</th>
                </tr>
              </thead>
              <tbody>
                {data.latihan.map((item, i) => (
                  <tr key={item.id}>
                    <td className="border border-black px-3 py-1">{i + 1}</td>
                    <td className="border border-black px-3 py-1">{item.latihanJudul}</td>
                    <td className="border border-black px-3 py-1">{formatDateShort(item.submittedAt)}</td>
                    <td className="border border-black px-3 py-1 text-center font-medium">
                      {item.nilai !== undefined ? item.nilai : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs mt-1 text-right">
              Rata-rata: <strong>{avg(data.latihan.map((h) => h.nilai))}</strong>
            </p>
          </>
        )}
      </div>

      <div>
        <h2 className="font-bold text-base mb-2">Nilai Tugas</h2>
        {data.tugas.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Belum ada tugas yang dikumpulkan.</p>
        ) : (
          <>
            <table className="w-full border-collapse border border-black text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black px-3 py-1 text-left w-8">No</th>
                  <th className="border border-black px-3 py-1 text-left">Judul Tugas</th>
                  <th className="border border-black px-3 py-1 text-left">Tgl Kumpul</th>
                  <th className="border border-black px-3 py-1 text-center w-16">Nilai</th>
                </tr>
              </thead>
              <tbody>
                {data.tugas.map((item, i) => (
                  <tr key={item.id}>
                    <td className="border border-black px-3 py-1">{i + 1}</td>
                    <td className="border border-black px-3 py-1">{item.tugasJudul}</td>
                    <td className="border border-black px-3 py-1">{formatDateShort(item.submittedAt)}</td>
                    <td className="border border-black px-3 py-1 text-center font-medium">
                      {item.nilai !== undefined ? item.nilai : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs mt-1 text-right">
              Rata-rata: <strong>{avg(data.tugas.map((s) => s.nilai))}</strong>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

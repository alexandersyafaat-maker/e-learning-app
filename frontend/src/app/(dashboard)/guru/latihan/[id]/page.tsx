import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, ClipboardList, User, GraduationCap, Calendar, CheckCircle2,
} from "lucide-react";
import { getSession } from "@/lib/session";
import { fetchLatihanById, fetchSemuaHasil } from "@/features/latihan/services/latihan.service";
import { Badge } from "@/components/ui/Badge";
import { LampiranList } from "@/components/ui/LampiranList";
import { formatDate } from "@/lib/utils";
import type { HasilLatihanView } from "@/features/latihan/types/latihan.types";

interface Props { params: Promise<{ id: string }> }


function HasilSiswaSection({ hasilList }: { hasilList: HasilLatihanView[] }) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-500" />
          Jawaban Siswa
          <span className="text-sm font-normal text-slate-400">({hasilList.length} dikumpulkan)</span>
        </h2>
      </div>
      {hasilList.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-400">Belum ada siswa yang mengumpulkan.</div>
      ) : (
        <div className="divide-y divide-slate-100">
          {hasilList.map((h) => (
            <div key={h.id} className="p-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{h.siswaNama}</p>
                  <p className="text-xs text-slate-400">{h.siswaEmail} · {formatDate(h.submittedAt)}</p>
                </div>
                {h.nilai !== undefined ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
                    Nilai: {h.nilai}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">Belum dinilai</span>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Jawaban</p>
                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 bg-slate-50 rounded-lg p-3 border border-slate-100">
                  {h.jawaban}
                </pre>
              </div>
              <LampiranList lampiran={h.lampiran} label="Lampiran Siswa" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const latihan = await fetchLatihanById(id);
  return { title: latihan ? `Detail — ${latihan.judul}` : "Latihan" };
}

export default async function GuruLatihanDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const [latihan, hasilList] = await Promise.all([
    fetchLatihanById(id),
    fetchSemuaHasil(id).catch(() => []),
  ]);
  if (!latihan) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/guru/latihan" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
        <ChevronLeft size={16} /> Kembali ke Kelola Latihan
      </Link>

      <article className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <ClipboardList size={16} className="text-indigo-600" />
            </div>
            <Badge variant="indigo">{latihan.kelasNama}</Badge>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">{latihan.judul}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><User size={14} />{latihan.guruNama}</span>
            <span className="flex items-center gap-1.5"><GraduationCap size={14} />{latihan.kelasNama}</span>
            {latihan.deadline && (
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                Deadline: {formatDate(latihan.deadline)}
              </span>
            )}
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Soal / Instruksi</h2>
            <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700 bg-slate-50 rounded-xl p-4 border border-slate-100">
              {latihan.deskripsi}
            </pre>
          </div>
          <LampiranList lampiran={latihan.lampiran} label="Lampiran" />
        </div>
      </article>

      <HasilSiswaSection hasilList={hasilList} />
    </div>
  );
}

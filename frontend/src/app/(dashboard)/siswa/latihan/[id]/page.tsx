import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, ClipboardList, User, Calendar, CheckCircle2,
} from "lucide-react";
import { getSession } from "@/lib/session";
import { fetchLatihanById, fetchHasilBySiswa } from "@/features/latihan/services/latihan.service";
import { LatihanSubmitForm } from "@/features/latihan/components/LatihanSubmitForm";
import { Badge } from "@/components/ui/Badge";
import { LampiranList } from "@/components/ui/LampiranList";

interface Props { params: Promise<{ id: string }> }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const latihan = await fetchLatihanById(id);
  return { title: latihan?.judul ?? "Latihan" };
}

export default async function SiswaLatihanDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const [latihan, hasilLatihan] = await Promise.all([
    fetchLatihanById(id),
    fetchHasilBySiswa(id, session.userId),
  ]);
  if (!latihan) notFound();

  const sudahDikerjakan = hasilLatihan !== null;

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/siswa/latihan" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
        <ChevronLeft size={16} /> Kembali ke Latihan
      </Link>

      {/* Soal */}
      <article className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <ClipboardList size={16} className="text-indigo-600" />
            </div>
            <Badge variant="indigo">{latihan.kelasNama}</Badge>
            {sudahDikerjakan && <Badge variant="emerald">Sudah Dikerjakan</Badge>}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">{latihan.judul}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-0">
            <span className="flex items-center gap-1.5"><User size={14} />{latihan.guruNama}</span>
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
          <LampiranList lampiran={latihan.lampiran} label="Lampiran dari Guru" />
        </div>
      </article>

      {/* Submission section */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        {sudahDikerjakan ? (
          <>
            <div className="p-6 border-b border-slate-100 bg-emerald-50 flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
              <div>
                <p className="font-semibold text-emerald-800 text-sm">Latihan sudah dikumpulkan</p>
                <p className="text-xs text-emerald-600">Dikumpulkan pada {formatDate(hasilLatihan!.submittedAt)}</p>
              </div>
            </div>
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-sm font-semibold text-slate-700 mb-3">Jawaban Anda</h2>
                <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700 bg-slate-50 rounded-xl p-4 border border-slate-100">
                  {hasilLatihan!.jawaban}
                </pre>
              </div>
              <LampiranList lampiran={hasilLatihan!.lampiran} label="Lampiran yang Dikumpulkan" />
              {hasilLatihan!.nilai !== undefined && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                  <p className="text-sm font-medium text-indigo-800">Nilai:</p>
                  <span className="text-2xl font-bold text-indigo-700">{hasilLatihan!.nilai}</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">Kumpulkan Jawaban</h2>
              <p className="text-sm text-slate-500 mt-0.5">Tulis jawaban dan lampirkan file jika diperlukan.</p>
            </div>
            <div className="p-6 sm:p-8">
              <LatihanSubmitForm latihanId={id} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

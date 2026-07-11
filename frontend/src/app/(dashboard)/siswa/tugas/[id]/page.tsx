import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, BookMarked, User, Calendar, CheckCircle2,
} from "lucide-react";
import { getSession } from "@/lib/session";
import { fetchTugasById, fetchSubmisiBySiswa } from "@/features/tugas/services/tugas.service";
import { TugasSubmitForm } from "@/features/tugas/components/TugasSubmitForm";
import { Badge } from "@/components/ui/Badge";
import { LampiranList } from "@/components/ui/LampiranList";

interface Props { params: Promise<{ id: string }> }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const tugas = await fetchTugasById(id);
  return { title: tugas?.judul ?? "Tugas" };
}

export default async function SiswaTugasDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const [tugas, submisi] = await Promise.all([
    fetchTugasById(id),
    fetchSubmisiBySiswa(id, session.userId),
  ]);
  if (!tugas) notFound();

  const sudahDikumpulkan = submisi !== null;

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/siswa/tugas" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
        <ChevronLeft size={16} /> Kembali ke Tugas
      </Link>

      {/* Tugas detail */}
      <article className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <BookMarked size={16} className="text-amber-600" />
            </div>
            <Badge variant="amber">{tugas.kelasNama}</Badge>
            {sudahDikumpulkan && <Badge variant="emerald">Sudah Dikumpulkan</Badge>}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">{tugas.judul}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><User size={14} />{tugas.guruNama}</span>
            {tugas.deadline && (
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                Deadline: {formatDate(tugas.deadline)}
              </span>
            )}
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Deskripsi / Ketentuan</h2>
            <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700 bg-slate-50 rounded-xl p-4 border border-slate-100">
              {tugas.deskripsi}
            </pre>
          </div>
          <LampiranList lampiran={tugas.lampiran} label="Lampiran dari Guru" />
        </div>
      </article>

      {/* Submission section */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        {sudahDikumpulkan ? (
          <>
            <div className="p-6 border-b border-slate-100 bg-emerald-50 flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
              <div>
                <p className="font-semibold text-emerald-800 text-sm">Tugas sudah dikumpulkan</p>
                <p className="text-xs text-emerald-600">Dikumpulkan pada {formatDate(submisi!.submittedAt)}</p>
              </div>
            </div>
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-sm font-semibold text-slate-700 mb-3">Jawaban Anda</h2>
                <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700 bg-slate-50 rounded-xl p-4 border border-slate-100">
                  {submisi!.jawaban}
                </pre>
              </div>
              <LampiranList lampiran={submisi!.lampiran} label="File yang Dikumpulkan" />
              {submisi!.catatan && (
                <div>
                  <h2 className="text-sm font-semibold text-slate-700 mb-3">Catatan</h2>
                  <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-4 border border-slate-100">{submisi!.catatan}</p>
                </div>
              )}
              {submisi!.nilai !== undefined && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                  <p className="text-sm font-medium text-indigo-800">Nilai:</p>
                  <span className="text-2xl font-bold text-indigo-700">{submisi!.nilai}</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">Kumpulkan Tugas</h2>
              <p className="text-sm text-slate-500 mt-0.5">Lampirkan file tugas Anda (foto, PDF, video, dll.).</p>
            </div>
            <div className="p-6 sm:p-8">
              <TugasSubmitForm tugasId={id} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

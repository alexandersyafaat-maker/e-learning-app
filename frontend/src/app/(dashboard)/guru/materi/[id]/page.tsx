import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  BookOpen,
  User,
  GraduationCap,
  Paperclip,
} from "lucide-react";
import { getSession } from "@/lib/session";
import { fetchMateriById } from "@/features/materi/services/materi.service";
import { fetchPesanByMateri } from "@/features/obrolan/services/obrolan.service";
import { ObrolanBox } from "@/features/obrolan/components/ObrolanBox";
import { Badge } from "@/components/ui/Badge";
import { LampiranList } from "@/components/ui/LampiranList";
import { formatDate } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const materi = await fetchMateriById(id);
  return { title: materi ? `Obrolan — ${materi.judul}` : "Materi" };
}

export default async function GuruMateriDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const [materi, messages] = await Promise.all([
    fetchMateriById(id),
    fetchPesanByMateri(id).catch(() => []),
  ]);

  if (!materi) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/guru/materi"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ChevronLeft size={16} />
        Kembali ke Daftar Materi
      </Link>

      <article className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <BookOpen size={16} className="text-indigo-600" />
            </div>
            <Badge variant="indigo">{materi.kelasNama}</Badge>
            {materi.lampiran.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Paperclip size={12} />
                {materi.lampiran.length} lampiran
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">{materi.judul}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <User size={14} />
              {materi.guruNama}
            </span>
            <span className="flex items-center gap-1.5">
              <GraduationCap size={14} />
              {materi.kelasNama}
            </span>
            <span>{formatDate(materi.createdAt)}</span>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700">
            {materi.konten}
          </pre>
        </div>

        {materi.lampiran.length > 0 && (
          <div className="p-6 sm:p-8 border-t border-slate-100">
            <LampiranList lampiran={materi.lampiran} />
          </div>
        )}
      </article>

      <ObrolanBox
        materiId={id}
        messages={messages}
        currentUserId={session.userId}
      />
    </div>
  );
}

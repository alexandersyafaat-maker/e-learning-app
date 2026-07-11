import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { MateriView } from "../types/materi.types";

export function MateriCard({ materi }: { materi: MateriView }) {
  const excerpt = materi.konten.slice(0, 120).replace(/\n/g, " ");

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4 hover:border-indigo-200 hover:shadow-md transition-all">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
          <BookOpen size={18} className="text-indigo-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 text-sm leading-snug mb-1 line-clamp-2">
            {materi.judul}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="indigo">{materi.kelasNama}</Badge>
            <span className="text-xs text-slate-400">{materi.guruNama}</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-500 line-clamp-3 flex-1">
        {excerpt}...
      </p>

      <Link
        href={`/siswa/materi/${materi.id}`}
        className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
      >
        Buka Materi
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}

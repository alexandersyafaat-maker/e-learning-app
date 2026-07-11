import Link from "next/link";
import { BookMarked, Calendar, CheckCircle2, Clock, ArrowRight, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { TugasWithStatus } from "../types/tugas.types";

function formatDeadline(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function isOverdue(iso?: string) {
  if (!iso) return false;
  return new Date(iso) < new Date();
}

export function TugasCard({ item }: { item: TugasWithStatus }) {
  const { submisi } = item;
  const sudahDikumpulkan = submisi !== null;
  const terlambat = isOverdue(item.deadline);

  return (
    <div className={`bg-white rounded-xl border shadow-sm p-5 flex flex-col gap-4 transition-all ${sudahDikumpulkan ? "border-emerald-200" : "border-slate-200 hover:border-amber-200 hover:shadow-md"}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${sudahDikumpulkan ? "bg-emerald-50" : "bg-amber-50"}`}>
          {sudahDikumpulkan
            ? <CheckCircle2 size={18} className="text-emerald-600" />
            : <BookMarked size={18} className="text-amber-600" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 text-sm leading-snug mb-1 line-clamp-2">{item.judul}</h3>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="amber">{item.kelasNama}</Badge>
            {sudahDikumpulkan
              ? <Badge variant="emerald">Sudah Dikumpulkan</Badge>
              : terlambat && item.deadline
                ? <Badge variant="red">Terlambat</Badge>
                : <Badge variant="neutral">Belum Dikumpulkan</Badge>
            }
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-500 line-clamp-2 flex-1">
        {item.deskripsi.slice(0, 100)}...
      </p>

      <div className="flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
        {item.deadline ? (
          <span className={`flex items-center gap-1 ${terlambat && !sudahDikumpulkan ? "text-red-500" : ""}`}>
            <Clock size={12} />
            {formatDeadline(item.deadline)}
          </span>
        ) : <span />}
        {item.lampiran.length > 0 && (
          <span className="flex items-center gap-1">
            <Paperclip size={12} />
            {item.lampiran.length} lampiran
          </span>
        )}
      </div>

      <Link
        href={`/siswa/tugas/${item.id}`}
        className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          sudahDikumpulkan
            ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
            : "bg-amber-500 hover:bg-amber-600 text-white"
        }`}
      >
        {sudahDikumpulkan ? "Lihat Submisi" : "Kumpulkan"}
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}

import Link from "next/link";
import { ClipboardList, Calendar, CheckCircle2, Clock, ArrowRight, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { LatihanWithStatus } from "../types/latihan.types";

function formatDeadline(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function isOverdue(iso?: string) {
  if (!iso) return false;
  return new Date(iso) < new Date();
}

export function LatihanCard({ item }: { item: LatihanWithStatus }) {
  const { hasilLatihan } = item;
  const sudahDikerjakan = hasilLatihan !== null;
  const terlambat = isOverdue(item.deadline);

  return (
    <div className={`bg-white rounded-xl border shadow-sm p-5 flex flex-col gap-4 transition-all ${sudahDikerjakan ? "border-emerald-200" : "border-slate-200 hover:border-indigo-200 hover:shadow-md"}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${sudahDikerjakan ? "bg-emerald-50" : "bg-indigo-50"}`}>
          {sudahDikerjakan
            ? <CheckCircle2 size={18} className="text-emerald-600" />
            : <ClipboardList size={18} className="text-indigo-600" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 text-sm leading-snug mb-1 line-clamp-2">{item.judul}</h3>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="indigo">{item.kelasNama}</Badge>
            {sudahDikerjakan
              ? <Badge variant="emerald">Sudah Dikerjakan</Badge>
              : terlambat && item.deadline
                ? <Badge variant="red">Terlambat</Badge>
                : <Badge variant="amber">Belum Dikerjakan</Badge>
            }
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-500 line-clamp-2 flex-1">
        {item.deskripsi.slice(0, 100)}...
      </p>

      <div className="flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
        {item.deadline ? (
          <span className={`flex items-center gap-1 ${terlambat && !sudahDikerjakan ? "text-red-500" : ""}`}>
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
        href={`/siswa/latihan/${item.id}`}
        className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          sudahDikerjakan
            ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
            : "bg-indigo-600 hover:bg-indigo-700 text-white"
        }`}
      >
        {sudahDikerjakan ? "Lihat Jawaban" : "Kerjakan"}
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}

"use client";

import { ExternalLink, Trash2, Plus, Video, Calendar, Clock, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { usePertemuanUIStore } from "../stores/pertemuan-ui.store";
import { PertemuanStatus } from "../types/pertemuan.types";
import type { PertemuanView } from "../types/pertemuan.types";

const STATUS_BADGE: Record<PertemuanStatus, { label: string; variant: "emerald" | "sky" | "neutral" }> = {
  [PertemuanStatus.TERJADWAL]: { label: "Terjadwal", variant: "sky" },
  [PertemuanStatus.BERLANGSUNG]: { label: "Sedang Berlangsung", variant: "emerald" },
  [PertemuanStatus.SELESAI]: { label: "Selesai", variant: "neutral" },
};

function formatJadwal(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button type="button" onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors shrink-0" title="Salin link">
      {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
    </button>
  );
}

interface PertemuanListProps {
  pertemuanList: PertemuanView[];
  isGuru?: boolean;
}

export function PertemuanList({ pertemuanList, isGuru = false }: PertemuanListProps) {
  const { openCreateModal, openDeleteDialog } = usePertemuanUIStore();

  if (pertemuanList.length === 0) {
    return (
      <div>
        {isGuru && (
          <div className="flex justify-end mb-4">
            <button type="button" onClick={openCreateModal} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
              <Plus size={16} /> Jadwalkan Pertemuan
            </button>
          </div>
        )}
        <EmptyState icon={Video} title="Belum ada pertemuan" description={isGuru ? "Klik Jadwalkan Pertemuan untuk membuat Zoom meeting baru." : "Belum ada pertemuan virtual yang dijadwalkan untuk kelas Anda."} />
      </div>
    );
  }

  const upcoming = pertemuanList.filter((p) => p.status !== PertemuanStatus.SELESAI);
  const selesai = pertemuanList.filter((p) => p.status === PertemuanStatus.SELESAI);

  return (
    <div className="space-y-6">
      {isGuru && (
        <div className="flex justify-end">
          <button type="button" onClick={openCreateModal} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} /> Jadwalkan Pertemuan
          </button>
        </div>
      )}

      {upcoming.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Mendatang & Berlangsung</h2>
          <div className="space-y-3">
            {upcoming.map((p) => (
              <PertemuanCard key={p.id} pertemuan={p} isGuru={isGuru} onDelete={isGuru ? () => openDeleteDialog(p.id, p.judul) : undefined} />
            ))}
          </div>
        </div>
      )}

      {selesai.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Riwayat</h2>
          <div className="space-y-3 opacity-70">
            {selesai.map((p) => (
              <PertemuanCard key={p.id} pertemuan={p} isGuru={isGuru} onDelete={isGuru ? () => openDeleteDialog(p.id, p.judul) : undefined} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PertemuanCard({ pertemuan: p, isGuru, onDelete }: { pertemuan: PertemuanView; isGuru: boolean; onDelete?: () => void }) {
  const badge = STATUS_BADGE[p.status];
  const isLive = p.status === PertemuanStatus.BERLANGSUNG;
  const isOver = p.status === PertemuanStatus.SELESAI;
  const joinUrl = isGuru ? p.zoomStartUrl : p.zoomJoinUrl;

  return (
    <div className={`bg-white rounded-xl border shadow-sm p-5 transition-all ${isLive ? "border-emerald-300 ring-1 ring-emerald-200" : "border-slate-200"}`}>
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isLive ? "bg-emerald-100" : "bg-indigo-50"}`}>
          <Video size={18} className={isLive ? "text-emerald-600" : "text-indigo-600"} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">{p.judul}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{p.kelasNama} · {p.guruNama}</p>
            </div>
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-4">
            <span className="flex items-center gap-1.5"><Calendar size={12} />{formatJadwal(p.jadwal)}</span>
            <span className="flex items-center gap-1.5"><Clock size={12} />{p.durasi} menit</span>
          </div>

          {/* Meeting info */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-0.5">Meeting ID</p>
                <p className="text-sm font-mono font-medium text-slate-800">{p.zoomMeetingId}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-0.5">Passcode</p>
                <p className="text-sm font-mono font-medium text-slate-800">{p.zoomPassword}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-500 mb-0.5">
                  {isGuru ? "Link Host (Mulai)" : "Link Bergabung"}
                </p>
                <p className="text-xs text-slate-600 truncate font-mono">{joinUrl}</p>
              </div>
              <CopyButton text={joinUrl} />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {!isOver && (
              <a
                href={joinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isLive ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
              >
                <Video size={15} />
                {isGuru ? (isLive ? "Mulai Sekarang" : "Buka Zoom") : "Bergabung"}
                <ExternalLink size={13} />
              </a>
            )}
            {!isGuru && !isOver && (
              <a
                href={`https://zoom.us/join`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Buka zoom.us
                <ExternalLink size={13} />
              </a>
            )}
            {isGuru && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 transition-colors ml-auto"
              >
                <Trash2 size={14} />
                Batalkan
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

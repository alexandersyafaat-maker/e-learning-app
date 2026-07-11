import type { Lampiran } from "@/lib/types";
import { Paperclip, FileText, File, Video, ImageIcon } from "lucide-react";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function LampiranTypeIcon({ tipe }: { tipe: string }) {
  if (tipe.startsWith("image/")) return <ImageIcon size={16} className="text-emerald-500" />;
  if (tipe.startsWith("video/")) return <Video size={16} className="text-sky-500" />;
  if (tipe === "application/pdf") return <FileText size={16} className="text-red-500" />;
  return <File size={16} className="text-slate-400" />;
}

function downloadHref(lmp: Lampiran) {
  return `/api/download?url=${encodeURIComponent(lmp.url)}&nama=${encodeURIComponent(lmp.nama)}`;
}

interface Props {
  lampiran: Lampiran[];
  label?: string;
  className?: string;
}

export function LampiranList({ lampiran, label = "Lampiran", className }: Props) {
  if (lampiran.length === 0) return null;
  return (
    <div className={className}>
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <Paperclip size={12} /> {label} ({lampiran.length})
      </h3>
      <div className="space-y-2">
        {lampiran.map((lmp) => (
          <div key={lmp.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50">
            <LampiranTypeIcon tipe={lmp.tipe} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-800 font-medium truncate">{lmp.nama}</p>
              <p className="text-xs text-slate-400">{formatBytes(lmp.ukuran)}</p>
            </div>
            <a
              href={lmp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-500 hover:text-slate-700 font-medium shrink-0 px-2 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              Lihat
            </a>
            <a
              href={downloadHref(lmp)}
              download={lmp.nama}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium shrink-0 px-3 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors"
            >
              Unduh
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

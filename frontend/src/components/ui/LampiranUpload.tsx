"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  X,
  FileText,
  ImageIcon,
  Video,
  File,
  Paperclip,
} from "lucide-react";
import type { Lampiran } from "@/lib/types";

const ACCEPT = "image/*,video/*,application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx";
const MAX_SIZE_MB = 10;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function FileIcon({ tipe }: { tipe: string }) {
  if (tipe.startsWith("image/")) return <ImageIcon size={16} className="text-emerald-500" />;
  if (tipe.startsWith("video/")) return <Video size={16} className="text-sky-500" />;
  if (tipe === "application/pdf") return <FileText size={16} className="text-red-500" />;
  return <File size={16} className="text-slate-400" />;
}

interface LampiranUploadProps {
  existingLampiran?: Lampiran[];
}

export function LampiranUpload({ existingLampiran = [] }: LampiranUploadProps) {
  // Trigger input — no name, cleared after each pick so same file can be re-added
  const triggerRef = useRef<HTMLInputElement>(null);
  // Shadow input — name="lampiran", files kept in sync via DataTransfer for FormData
  const shadowRef = useRef<HTMLInputElement>(null);

  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [keptLampiran, setKeptLampiran] = useState<Lampiran[]>(existingLampiran);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  function syncShadow(files: File[]) {
    if (!shadowRef.current) return;
    const dt = new DataTransfer();
    for (const f of files) dt.items.add(f);
    shadowRef.current.files = dt.files;
  }

  function addFiles(incoming: FileList | File[]) {
    const arr = Array.from(incoming);
    const errs: string[] = [];
    const valid: File[] = [];
    for (const f of arr) {
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        errs.push(`${f.name} melebihi batas ${MAX_SIZE_MB}MB.`);
      } else {
        valid.push(f);
      }
    }
    setErrors(errs);
    setNewFiles((prev) => {
      const updated = [...prev, ...valid];
      syncShadow(updated);
      return updated;
    });
  }

  function removeNew(idx: number) {
    setNewFiles((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      syncShadow(updated);
      return updated;
    });
  }

  function removeExisting(id: string) {
    setKeptLampiran((prev) => prev.filter((l) => l.id !== id));
  }

  const onTriggerChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = "";
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const totalCount = keptLampiran.length + newFiles.length;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">
        Lampiran <span className="text-slate-400 font-normal">(opsional)</span>
      </label>

      {/* Keeps existing lampiran JSON for update action */}
      <input type="hidden" name="keptLampiran" value={JSON.stringify(keptLampiran)} />

      {/* Trigger: no name, cleared so same file can be re-picked */}
      <input
        ref={triggerRef}
        type="file"
        multiple
        accept={ACCEPT}
        onChange={onTriggerChange}
        className="hidden"
      />

      {/* Shadow: name="lampiran", synced via DataTransfer — picked up by FormData */}
      <input ref={shadowRef} type="file" name="lampiran" multiple className="hidden" />

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => triggerRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-xl border-2 border-dashed cursor-pointer transition-colors text-center ${
          dragOver
            ? "border-indigo-400 bg-indigo-50"
            : "border-slate-300 hover:border-slate-400 hover:bg-slate-50"
        }`}
      >
        <Upload size={20} className="text-slate-400" />
        <div>
          <p className="text-sm text-slate-600 font-medium">Klik atau seret file ke sini</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Gambar, video, PDF, Word, PowerPoint · Maks. {MAX_SIZE_MB}MB per file
          </p>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((e, i) => <p key={i} className="text-xs text-red-600">{e}</p>)}
        </div>
      )}

      {totalCount > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <Paperclip size={12} />
            {totalCount} file terlampir
          </p>

          {keptLampiran.map((lmp) => (
            <div key={lmp.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50">
              <FileIcon tipe={lmp.tipe} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-800 truncate font-medium">{lmp.nama}</p>
                <p className="text-xs text-slate-400">{formatBytes(lmp.ukuran)}</p>
              </div>
              <span className="text-xs text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full shrink-0">Tersimpan</span>
              <button type="button" onClick={() => removeExisting(lmp.id)} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors shrink-0">
                <X size={14} />
              </button>
            </div>
          ))}

          {newFiles.map((file, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-indigo-200 bg-indigo-50/40">
              <FileIcon tipe={file.type} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-800 truncate font-medium">{file.name}</p>
                <p className="text-xs text-slate-400">{formatBytes(file.size)}</p>
              </div>
              <span className="text-xs text-indigo-600 bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-full shrink-0">Baru</span>
              <button type="button" onClick={() => removeNew(i)} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors shrink-0">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

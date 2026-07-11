"use client";

import { RotateCcw, ThumbsUp, Minus, X } from "lucide-react";

interface FlipCardProps {
  word: string;
  translation: string;
  definition: string;
  example: string;
  v1?: string;
  v2?: string;
  v3?: string;
  ving?: string;
  vs?: string;
  flipped: boolean;
  onFlip: () => void;
  onRate: (quality: 0 | 3 | 5) => void;
  current: number;
  total: number;
}

export function FlipCard({
  word,
  translation,
  definition,
  example,
  v1,
  v2,
  v3,
  ving,
  vs,
  flipped,
  onFlip,
  onRate,
  current,
  total,
}: FlipCardProps) {
  const hasVerbForms = v1 || v2 || v3 || ving || vs;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>Kartu {current} dari {total}</span>
          <span>{Math.round((current / total) * 100)}% selesai</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${(current / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Flip card */}
      <div className="w-full" style={{ perspective: "1000px" }}>
        <div
          className="relative w-full transition-transform duration-500 cursor-pointer"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            minHeight: hasVerbForms ? "340px" : "260px",
          }}
          onClick={!flipped ? onFlip : undefined}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-white rounded-2xl border-2 border-slate-200 flex flex-col items-center justify-center p-8 text-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
              Apa artinya?
            </p>
            <h2 className="text-4xl font-bold text-slate-900 mb-3">{word}</h2>
            {hasVerbForms && (
              <p className="text-xs text-slate-400 mt-2">
                Verb — ingat V1, V2, V3-nya!
              </p>
            )}
            <p className="text-sm text-slate-400 mt-4 flex items-center gap-1.5">
              <RotateCcw size={14} />
              Klik untuk lihat jawaban
            </p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200 flex flex-col justify-center p-7"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="space-y-3">
              <div>
                <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-widest mb-0.5">
                  Terjemahan
                </p>
                <p className="text-xl font-bold text-slate-900">{translation}</p>
              </div>

              {/* Verb forms table */}
              {hasVerbForms && (
                <div>
                  <p className="text-[11px] font-semibold text-indigo-600 uppercase tracking-widest mb-1.5">
                    Bentuk Verb
                  </p>
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { label: "V1", sub: "Infinitive", value: v1 },
                        { label: "V2", sub: "Past Simple", value: v2 },
                        { label: "V3", sub: "Past Participle", value: v3 },
                      ].map(({ label, sub, value }) => (
                        <div
                          key={label}
                          className="bg-white/70 rounded-xl border border-indigo-100 px-2 py-1.5 text-center"
                        >
                          <p className="text-[10px] font-bold text-indigo-600 leading-none">{label}</p>
                          <p className="text-[9px] text-indigo-400 leading-tight mb-1">{sub}</p>
                          <p className="text-sm font-bold text-slate-900">{value ?? "—"}</p>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { label: "V-ing", sub: "Present Participle", value: ving },
                        { label: "V-s/es", sub: "3rd Person Singular", value: vs },
                      ].map(({ label, sub, value }) => (
                        <div
                          key={label}
                          className="bg-white/70 rounded-xl border border-indigo-100 px-2 py-1.5 text-center"
                        >
                          <p className="text-[10px] font-bold text-indigo-600 leading-none">{label}</p>
                          <p className="text-[9px] text-indigo-400 leading-tight mb-1">{sub}</p>
                          <p className="text-sm font-bold text-slate-900">{value ?? "—"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-0.5">
                  Definisi
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">{definition}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-0.5">
                  Contoh
                </p>
                <p className="text-sm text-slate-600 italic leading-relaxed">&ldquo;{example}&rdquo;</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating buttons — only visible when flipped */}
      <div
        className={`transition-all duration-300 ${
          flipped ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <p className="text-center text-xs text-slate-500 mb-3">Seberapa baik kamu mengingatnya?</p>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => onRate(0)}
            disabled={false}
            className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 transition-colors disabled:opacity-50 group"
          >
            <X size={20} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold">Tidak Ingat</span>
            <span className="text-[10px] text-red-500">Ulangi besok</span>
          </button>
          <button
            onClick={() => onRate(3)}
            disabled={false}
            className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 transition-colors disabled:opacity-50 group"
          >
            <Minus size={20} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold">Ragu-ragu</span>
            <span className="text-[10px] text-amber-500">Review lebih cepat</span>
          </button>
          <button
            onClick={() => onRate(5)}
            disabled={false}
            className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 transition-colors disabled:opacity-50 group"
          >
            <ThumbsUp size={20} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold">Ingat!</span>
            <span className="text-[10px] text-emerald-500">Interval naik</span>
          </button>
        </div>
      </div>
    </div>
  );
}

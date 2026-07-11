"use client";

import { useState, useTransition } from "react";
import { CheckCircle, AlertCircle, Loader2, Wand2, X } from "lucide-react";
import { checkGrammarAction } from "@/features/grammar/actions/check-grammar.action";
import type { GrammarMatch } from "@/features/grammar/types/grammar.types";

interface GrammarTextareaProps {
  name: string;
  label?: string;
  hint?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  defaultValue?: string;
}

const CATEGORY_STYLE: Record<string, string> = {
  GRAMMAR: "text-red-700 bg-red-50 border-red-200",
  TYPOS: "text-orange-700 bg-orange-50 border-orange-200",
  STYLE: "text-blue-700 bg-blue-50 border-blue-200",
  PUNCTUATION: "text-violet-700 bg-violet-50 border-violet-200",
};

export function GrammarTextarea({
  name,
  label,
  hint,
  placeholder,
  required,
  disabled,
  rows = 8,
  defaultValue = "",
}: GrammarTextareaProps) {
  const [value, setValue] = useState(defaultValue);
  const [matches, setMatches] = useState<GrammarMatch[]>([]);
  const [checked, setChecked] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isChecking, startTransition] = useTransition();

  function handleCheck() {
    if (!value.trim() || disabled) return;
    setApiError(null);
    setChecked(false);
    startTransition(async () => {
      const result = await checkGrammarAction(value);
      if (result.success) {
        setMatches(result.data.matches);
        setChecked(true);
      } else {
        setApiError(result.error);
      }
    });
  }

  function applyFix(match: GrammarMatch, replacement: string) {
    const newVal =
      value.slice(0, match.offset) + replacement + value.slice(match.offset + match.length);
    setValue(newVal);
    setMatches([]);
    setChecked(false);
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    if (checked) {
      setMatches([]);
      setChecked(false);
    }
  }

  const errorText = (match: GrammarMatch) =>
    value.slice(match.offset, match.offset + match.length);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        {label && (
          <label className="block text-sm font-semibold text-slate-800">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <button
          type="button"
          onClick={handleCheck}
          disabled={isChecking || !value.trim() || !!disabled}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed border border-violet-200 shrink-0"
        >
          {isChecking ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Wand2 size={13} />
          )}
          {isChecking ? "Memeriksa..." : "Periksa Grammar"}
        </button>
      </div>

      {hint && <p className="text-xs text-slate-500 -mt-1">{hint}</p>}

      <textarea
        name={name}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        rows={rows}
        value={value}
        onChange={handleChange}
        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 resize-y"
      />

      {apiError && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <AlertCircle size={13} />
          {apiError}
        </p>
      )}

      {checked && matches.length === 0 && (
        <div className="flex items-center gap-2 text-emerald-700 text-sm bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5">
          <CheckCircle size={16} className="shrink-0" />
          <span>Tidak ada kesalahan grammar ditemukan!</span>
        </div>
      )}

      {matches.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
            <AlertCircle size={13} className="text-amber-500" />
            {matches.length} potensi kesalahan — klik saran untuk memperbaiki otomatis:
          </p>
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {matches.map((match, i) => {
              const catId = match.rule.category.id;
              const colorClass =
                CATEGORY_STYLE[catId] ?? "text-slate-700 bg-slate-50 border-slate-200";
              const badText = errorText(match);
              return (
                <div key={i} className={`text-xs rounded-lg border px-3 py-2 ${colorClass}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {badText && (
                          <span className="font-mono font-semibold bg-white/60 rounded px-1 shrink-0">
                            &ldquo;{badText}&rdquo;
                          </span>
                        )}
                        <span className="text-[11px] opacity-80">
                          [{match.rule.category.name}]
                        </span>
                      </div>
                      <p className="leading-snug">{match.message}</p>
                      {match.replacements.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          <span className="text-[11px] opacity-70 self-center">Saran:</span>
                          {match.replacements.slice(0, 4).map((r, j) => (
                            <button
                              key={j}
                              type="button"
                              onClick={() => applyFix(match, r.value)}
                              className="px-2 py-0.5 rounded bg-white border border-current text-[11px] font-semibold hover:opacity-80 transition-opacity"
                            >
                              {r.value}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setMatches((prev) => prev.filter((_, idx) => idx !== i))}
                      className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

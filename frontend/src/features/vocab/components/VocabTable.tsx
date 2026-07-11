"use client";

import { Plus, Trash2, BookMarked, GraduationCap } from "lucide-react";
import { useVocabUIStore } from "../stores/vocab-ui.store";
import type { VocabCardView } from "../types/vocab.types";

export function VocabTable({ cards }: { cards: VocabCardView[] }) {
  const { openModal, setDeletingCard } = useVocabUIStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Daftar Kartu Kosakata</h2>
          <p className="text-sm text-slate-500">{cards.length} kartu tersimpan</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
        >
          <Plus size={16} />
          Tambah Kosakata
        </button>
      </div>

      {cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
            <BookMarked size={24} className="text-emerald-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-700 mb-1">Belum ada kartu kosakata</h3>
          <p className="text-sm text-slate-400 max-w-xs mb-4">
            Tambahkan kartu kosakata untuk mulai sesi review bagi siswa Anda.
          </p>
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
          >
            <Plus size={15} />
            Tambah Kartu Pertama
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3 w-10">
                    No.
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3 min-w-[120px]">
                    Kata
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3 min-w-[140px]">
                    Terjemahan
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3 min-w-[160px]">
                    Definisi
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3 min-w-[220px]">
                    Bentuk Verb
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3 min-w-[100px]">
                    Kelas
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-500 px-4 py-3 w-16">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {cards.map((card, idx) => (
                  <tr key={card.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-3.5 text-sm text-slate-400">{idx + 1}</td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-900 text-sm">{card.word}</span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-600">{card.translation}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-500 max-w-xs">
                      <span className="line-clamp-2 leading-snug">{card.definition}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      {card.v1 || card.v2 || card.v3 || card.ving || card.vs ? (
                        <div className="flex items-center gap-1 flex-wrap">
                          {[
                            { label: "V1", value: card.v1 },
                            { label: "V2", value: card.v2 },
                            { label: "V3", value: card.v3 },
                            { label: "Ving", value: card.ving },
                            { label: "Vs", value: card.vs },
                          ].filter((f) => f.value).map((f) => (
                            <span
                              key={f.label}
                              className="inline-flex items-center gap-1 text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md font-mono"
                            >
                              <span className="text-[9px] text-indigo-400 font-sans">{f.label}</span>
                              {f.value}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-lg">
                        <GraduationCap size={11} />
                        {card.kelasNama}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => setDeletingCard(card)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                        title="Hapus kartu"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

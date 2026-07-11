"use client";

import { create } from "zustand";
import type { HasilLatihanNilai, SubmisiTugasNilai } from "../types/nilai.types";

type ModalTarget =
  | { type: "latihan"; item: HasilLatihanNilai }
  | { type: "tugas"; item: SubmisiTugasNilai }
  | null;

interface NilaiUIStore {
  activeTab: "latihan" | "tugas";
  setActiveTab: (tab: "latihan" | "tugas") => void;
  modalTarget: ModalTarget;
  openModal: (target: NonNullable<ModalTarget>) => void;
  closeModal: () => void;
}

export const useNilaiUIStore = create<NilaiUIStore>((set) => ({
  activeTab: "latihan",
  setActiveTab: (tab) => set({ activeTab: tab }),
  modalTarget: null,
  openModal: (target) => set({ modalTarget: target }),
  closeModal: () => set({ modalTarget: null }),
}));

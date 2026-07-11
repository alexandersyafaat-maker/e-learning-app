import { create } from "zustand";
import type { VocabCard } from "../types/vocab.types";

interface VocabUIStore {
  isModalOpen: boolean;
  deletingCard: VocabCard | null;
  openModal: () => void;
  closeModal: () => void;
  setDeletingCard: (card: VocabCard | null) => void;
}

export const useVocabUIStore = create<VocabUIStore>((set) => ({
  isModalOpen: false,
  deletingCard: null,
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
  setDeletingCard: (card) => set({ deletingCard: card }),
}));

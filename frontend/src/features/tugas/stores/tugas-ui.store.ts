"use client";

import { create } from "zustand";
import type { TugasView } from "../types/tugas.types";

interface TugasUIStore {
  modalOpen: boolean;
  selectedTugas: TugasView | null;
  deleteTargetId: string | null;
  deleteTargetName: string | null;
  openCreateModal: () => void;
  openEditModal: (tugas: TugasView) => void;
  closeModal: () => void;
  openDeleteDialog: (id: string, name: string) => void;
  closeDeleteDialog: () => void;
}

export const useTugasUIStore = create<TugasUIStore>((set) => ({
  modalOpen: false,
  selectedTugas: null,
  deleteTargetId: null,
  deleteTargetName: null,
  openCreateModal: () => set({ modalOpen: true, selectedTugas: null }),
  openEditModal: (tugas) => set({ modalOpen: true, selectedTugas: tugas }),
  closeModal: () => set({ modalOpen: false, selectedTugas: null }),
  openDeleteDialog: (id, name) => set({ deleteTargetId: id, deleteTargetName: name }),
  closeDeleteDialog: () => set({ deleteTargetId: null, deleteTargetName: null }),
}));

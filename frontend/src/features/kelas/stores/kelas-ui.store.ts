"use client";

import { create } from "zustand";
import type { Kelas } from "../types/kelas.types";

interface KelasUIStore {
  modalOpen: boolean;
  selectedKelas: Kelas | null;
  deleteTargetId: string | null;
  deleteTargetName: string | null;
  openCreateModal: () => void;
  openEditModal: (kelas: Kelas) => void;
  closeModal: () => void;
  openDeleteDialog: (id: string, name: string) => void;
  closeDeleteDialog: () => void;
}

export const useKelasUIStore = create<KelasUIStore>((set) => ({
  modalOpen: false,
  selectedKelas: null,
  deleteTargetId: null,
  deleteTargetName: null,
  openCreateModal: () => set({ modalOpen: true, selectedKelas: null }),
  openEditModal: (kelas) => set({ modalOpen: true, selectedKelas: kelas }),
  closeModal: () => set({ modalOpen: false, selectedKelas: null }),
  openDeleteDialog: (id, name) =>
    set({ deleteTargetId: id, deleteTargetName: name }),
  closeDeleteDialog: () =>
    set({ deleteTargetId: null, deleteTargetName: null }),
}));

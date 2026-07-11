"use client";

import { create } from "zustand";
import type { MateriView } from "../types/materi.types";

interface MateriUIStore {
  modalOpen: boolean;
  selectedMateri: MateriView | null;
  deleteTargetId: string | null;
  deleteTargetName: string | null;
  openCreateModal: () => void;
  openEditModal: (materi: MateriView) => void;
  closeModal: () => void;
  openDeleteDialog: (id: string, name: string) => void;
  closeDeleteDialog: () => void;
}

export const useMateriUIStore = create<MateriUIStore>((set) => ({
  modalOpen: false,
  selectedMateri: null,
  deleteTargetId: null,
  deleteTargetName: null,
  openCreateModal: () => set({ modalOpen: true, selectedMateri: null }),
  openEditModal: (materi) => set({ modalOpen: true, selectedMateri: materi }),
  closeModal: () => set({ modalOpen: false, selectedMateri: null }),
  openDeleteDialog: (id, name) => set({ deleteTargetId: id, deleteTargetName: name }),
  closeDeleteDialog: () => set({ deleteTargetId: null, deleteTargetName: null }),
}));

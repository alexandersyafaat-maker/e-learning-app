"use client";

import { create } from "zustand";

interface PertemuanUIStore {
  modalOpen: boolean;
  deleteTargetId: string | null;
  deleteTargetName: string | null;
  openCreateModal: () => void;
  closeModal: () => void;
  openDeleteDialog: (id: string, name: string) => void;
  closeDeleteDialog: () => void;
}

export const usePertemuanUIStore = create<PertemuanUIStore>((set) => ({
  modalOpen: false,
  deleteTargetId: null,
  deleteTargetName: null,
  openCreateModal: () => set({ modalOpen: true }),
  closeModal: () => set({ modalOpen: false }),
  openDeleteDialog: (id, name) => set({ deleteTargetId: id, deleteTargetName: name }),
  closeDeleteDialog: () => set({ deleteTargetId: null, deleteTargetName: null }),
}));

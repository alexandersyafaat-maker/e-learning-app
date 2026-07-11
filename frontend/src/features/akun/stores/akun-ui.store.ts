"use client";

import { create } from "zustand";
import type { Akun } from "../types/akun.types";

interface AkunUIStore {
  modalOpen: boolean;
  selectedAkun: Akun | null;
  deleteTargetId: string | null;
  deleteTargetName: string | null;
  openCreateModal: () => void;
  openEditModal: (akun: Akun) => void;
  closeModal: () => void;
  openDeleteDialog: (id: string, name: string) => void;
  closeDeleteDialog: () => void;
}

export const useAkunUIStore = create<AkunUIStore>((set) => ({
  modalOpen: false,
  selectedAkun: null,
  deleteTargetId: null,
  deleteTargetName: null,
  openCreateModal: () => set({ modalOpen: true, selectedAkun: null }),
  openEditModal: (akun) => set({ modalOpen: true, selectedAkun: akun }),
  closeModal: () => set({ modalOpen: false, selectedAkun: null }),
  openDeleteDialog: (id, name) =>
    set({ deleteTargetId: id, deleteTargetName: name }),
  closeDeleteDialog: () =>
    set({ deleteTargetId: null, deleteTargetName: null }),
}));

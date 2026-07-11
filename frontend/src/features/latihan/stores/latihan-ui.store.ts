"use client";

import { create } from "zustand";
import type { LatihanView } from "../types/latihan.types";

interface LatihanUIStore {
  modalOpen: boolean;
  selectedLatihan: LatihanView | null;
  deleteTargetId: string | null;
  deleteTargetName: string | null;
  openCreateModal: () => void;
  openEditModal: (latihan: LatihanView) => void;
  closeModal: () => void;
  openDeleteDialog: (id: string, name: string) => void;
  closeDeleteDialog: () => void;
}

export const useLatihanUIStore = create<LatihanUIStore>((set) => ({
  modalOpen: false,
  selectedLatihan: null,
  deleteTargetId: null,
  deleteTargetName: null,
  openCreateModal: () => set({ modalOpen: true, selectedLatihan: null }),
  openEditModal: (latihan) => set({ modalOpen: true, selectedLatihan: latihan }),
  closeModal: () => set({ modalOpen: false, selectedLatihan: null }),
  openDeleteDialog: (id, name) => set({ deleteTargetId: id, deleteTargetName: name }),
  closeDeleteDialog: () => set({ deleteTargetId: null, deleteTargetName: null }),
}));

import type { BaseEntity } from "@/lib/types";

export interface Kelas extends BaseEntity {
  nama: string;
  tingkat: string;
  tahunAjaran: string;
  deskripsi?: string;
}

export interface CreateKelasInput {
  nama: string;
  tingkat: string;
  tahunAjaran: string;
  deskripsi?: string;
}

export type UpdateKelasInput = CreateKelasInput;

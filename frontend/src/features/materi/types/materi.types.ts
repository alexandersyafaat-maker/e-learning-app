import type { BaseEntity, Lampiran } from "@/lib/types";

export interface Materi extends BaseEntity {
  judul: string;
  konten: string;
  kelasId: string;
  guruId: string;
  lampiran: Lampiran[];
}

export interface MateriView extends Materi {
  kelasNama: string;
  guruNama: string;
}

export interface CreateMateriInput {
  judul: string;
  konten: string;
  kelasId: string;
  guruId: string;
  lampiran: Lampiran[];
}

export interface UpdateMateriInput {
  judul: string;
  konten: string;
  kelasId: string;
  lampiran: Lampiran[];
}

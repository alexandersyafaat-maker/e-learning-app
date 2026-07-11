import type { BaseEntity, Lampiran } from "@/lib/types";

export interface Latihan extends BaseEntity {
  judul: string;
  deskripsi: string;
  kelasId: string;
  guruId: string;
  deadline?: string;
  lampiran: Lampiran[];
}

export interface LatihanView extends Latihan {
  kelasNama: string;
  guruNama: string;
}

export interface HasilLatihan extends BaseEntity {
  latihanId: string;
  siswaId: string;
  jawaban: string;
  lampiran: Lampiran[];
  nilai?: number;
  submittedAt: string;
}

export interface HasilLatihanView extends HasilLatihan {
  siswaNama: string;
  siswaEmail: string;
}

export interface LatihanWithStatus extends LatihanView {
  hasilLatihan: HasilLatihan | null;
}

export interface CreateLatihanInput {
  judul: string;
  deskripsi: string;
  kelasId: string;
  guruId: string;
  deadline?: string;
  lampiran: Lampiran[];
}

export interface UpdateLatihanInput {
  judul: string;
  deskripsi: string;
  kelasId: string;
  deadline?: string;
  lampiran: Lampiran[];
}

export interface SubmitLatihanInput {
  latihanId: string;
  siswaId: string;
  jawaban: string;
  lampiran: Lampiran[];
}

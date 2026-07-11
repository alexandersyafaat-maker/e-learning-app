import type { BaseEntity, Lampiran } from "@/lib/types";

export interface Tugas extends BaseEntity {
  judul: string;
  deskripsi: string;
  kelasId: string;
  guruId: string;
  deadline?: string;
  lampiran: Lampiran[];
}

export interface TugasView extends Tugas {
  kelasNama: string;
  guruNama: string;
}

export interface SubmisiTugas extends BaseEntity {
  tugasId: string;
  siswaId: string;
  jawaban: string;
  catatan: string;
  lampiran: Lampiran[];
  nilai?: number;
  submittedAt: string;
}

export interface SubmisiTugasView extends SubmisiTugas {
  siswaNama: string;
  siswaEmail: string;
}

export interface TugasWithStatus extends TugasView {
  submisi: SubmisiTugas | null;
}

export interface CreateTugasInput {
  judul: string;
  deskripsi: string;
  kelasId: string;
  guruId: string;
  deadline?: string;
  lampiran: Lampiran[];
}

export interface UpdateTugasInput {
  judul: string;
  deskripsi: string;
  kelasId: string;
  deadline?: string;
  lampiran: Lampiran[];
}

export interface SubmitTugasInput {
  tugasId: string;
  siswaId: string;
  jawaban: string;
  catatan: string;
  lampiran: Lampiran[];
}

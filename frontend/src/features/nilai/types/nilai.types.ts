import type { BaseEntity, Lampiran } from "@/lib/types";

export interface HasilLatihanNilai extends BaseEntity {
  latihanId: string;
  latihanJudul: string;
  siswaId: string;
  siswaNama: string;
  siswaEmail: string;
  kelasId: string;
  kelasNama: string;
  jawaban: string;
  lampiran: Lampiran[];
  nilai?: number;
  submittedAt: string;
}

export interface SubmisiTugasNilai extends BaseEntity {
  tugasId: string;
  tugasJudul: string;
  siswaId: string;
  siswaNama: string;
  siswaEmail: string;
  kelasId: string;
  kelasNama: string;
  jawaban: string;
  catatan: string;
  lampiran: Lampiran[];
  nilai?: number;
  submittedAt: string;
}

export interface NilaiSiswa {
  latihan: HasilLatihanNilai[];
  tugas: SubmisiTugasNilai[];
}

export interface UpdateNilaiInput {
  nilai: number;
}

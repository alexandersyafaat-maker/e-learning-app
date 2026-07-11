import type { BaseEntity } from "@/lib/types";

export interface PesanObrolan extends BaseEntity {
  materiId: string;
  userId: string;
  userNama: string;
  userRole: "GURU" | "SISWA";
  teks: string;
}

export interface SendPesanInput {
  teks: string;
  userId: string;
  userNama: string;
  userRole: "GURU" | "SISWA";
}

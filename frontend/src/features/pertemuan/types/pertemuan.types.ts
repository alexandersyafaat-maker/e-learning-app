import type { BaseEntity } from "@/lib/types";

export enum PertemuanStatus {
  TERJADWAL = "TERJADWAL",
  BERLANGSUNG = "BERLANGSUNG",
  SELESAI = "SELESAI",
}

export interface Pertemuan extends BaseEntity {
  judul: string;
  kelasId: string;
  guruId: string;
  jadwal: string;
  durasi: number;
  zoomMeetingId: string;
  zoomJoinUrl: string;
  zoomStartUrl: string;
  zoomPassword: string;
  status: PertemuanStatus;
}

export interface PertemuanView extends Pertemuan {
  kelasNama: string;
  guruNama: string;
}

export interface CreatePertemuanInput {
  judul: string;
  kelasId: string;
  guruId: string;
  jadwal: string;
  durasi: number;
}

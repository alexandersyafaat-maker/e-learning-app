export type ActionResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lampiran {
  id: string;
  nama: string;
  ukuran: number;
  tipe: string;
  url: string;
}

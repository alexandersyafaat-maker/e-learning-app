import type { Pertemuan, PertemuanView, CreatePertemuanInput } from "../types/pertemuan.types";
import { apiFetch, apiDelete } from "@/lib/api";

export async function fetchPertemuanByGuru(guruId: string): Promise<PertemuanView[]> {
  return apiFetch<PertemuanView[]>(`/pertemuan?guruId=${guruId}`);
}

// siswaId only — backend auto-resolves kelasId
export async function fetchPertemuanForSiswa(siswaId: string): Promise<PertemuanView[]> {
  return apiFetch<PertemuanView[]>(`/pertemuan?siswaId=${siswaId}`);
}

export async function createPertemuanRequest(input: CreatePertemuanInput): Promise<Pertemuan> {
  return apiFetch<Pertemuan>("/pertemuan", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function deletePertemuanRequest(id: string): Promise<boolean> {
  return apiDelete(`/pertemuan/${id}`);
}

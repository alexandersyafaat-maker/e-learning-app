import type {
  Latihan,
  LatihanView,
  LatihanWithStatus,
  HasilLatihan,
  HasilLatihanView,
  CreateLatihanInput,
  UpdateLatihanInput,
  SubmitLatihanInput,
} from "../types/latihan.types";
import { apiFetch, apiDelete } from "@/lib/api";

export async function fetchLatihanByGuru(guruId: string): Promise<LatihanView[]> {
  return apiFetch<LatihanView[]>(`/latihan?guruId=${guruId}`);
}

// siswaId only — backend auto-resolves kelasId from user.kelasId
export async function fetchLatihanForSiswa(siswaId: string): Promise<LatihanWithStatus[]> {
  return apiFetch<LatihanWithStatus[]>(`/latihan?siswaId=${siswaId}`);
}

export async function fetchLatihanById(id: string): Promise<LatihanView | null> {
  try {
    return await apiFetch<LatihanView>(`/latihan/${id}`);
  } catch {
    return null;
  }
}

// GET /latihan/:id/hasil/:siswaId
export async function fetchHasilBySiswa(latihanId: string, siswaId: string): Promise<HasilLatihan | null> {
  try {
    return await apiFetch<HasilLatihan>(`/latihan/${latihanId}/hasil/${siswaId}`);
  } catch {
    return null;
  }
}

export async function fetchSemuaHasil(latihanId: string): Promise<HasilLatihanView[]> {
  return apiFetch<HasilLatihanView[]>(`/latihan/${latihanId}/hasil`);
}

export async function createLatihanRequest(input: CreateLatihanInput): Promise<Latihan> {
  return apiFetch<Latihan>("/latihan", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateLatihanRequest(id: string, input: UpdateLatihanInput): Promise<Latihan | null> {
  try {
    return await apiFetch<Latihan>(`/latihan/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  } catch {
    return null;
  }
}

export async function deleteLatihanRequest(id: string): Promise<boolean> {
  return apiDelete(`/latihan/${id}`);
}

export async function submitLatihanRequest(input: SubmitLatihanInput): Promise<HasilLatihan> {
  return apiFetch<HasilLatihan>(`/latihan/${input.latihanId}/submit`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function beriNilaiLatihanRequest(
  latihanId: string,
  hasilId: string,
  nilai: number
): Promise<HasilLatihan> {
  return apiFetch<HasilLatihan>(`/latihan/${latihanId}/hasil/${hasilId}/nilai`, {
    method: "PATCH",
    body: JSON.stringify({ nilai }),
  });
}

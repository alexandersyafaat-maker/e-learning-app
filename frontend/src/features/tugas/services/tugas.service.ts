import type {
  Tugas,
  TugasView,
  TugasWithStatus,
  SubmisiTugas,
  SubmisiTugasView,
  CreateTugasInput,
  UpdateTugasInput,
  SubmitTugasInput,
} from "../types/tugas.types";
import { apiFetch, apiDelete } from "@/lib/api";

export async function fetchTugasByGuru(guruId: string): Promise<TugasView[]> {
  return apiFetch<TugasView[]>(`/tugas?guruId=${guruId}`);
}

// siswaId only — backend auto-resolves kelasId
export async function fetchTugasForSiswa(siswaId: string): Promise<TugasWithStatus[]> {
  return apiFetch<TugasWithStatus[]>(`/tugas?siswaId=${siswaId}`);
}

export async function fetchTugasById(id: string): Promise<TugasView | null> {
  try {
    return await apiFetch<TugasView>(`/tugas/${id}`);
  } catch {
    return null;
  }
}

// GET /tugas/:id/submisi/:siswaId
export async function fetchSubmisiBySiswa(tugasId: string, siswaId: string): Promise<SubmisiTugas | null> {
  try {
    return await apiFetch<SubmisiTugas>(`/tugas/${tugasId}/submisi/${siswaId}`);
  } catch {
    return null;
  }
}

export async function fetchSemuaSubmisi(tugasId: string): Promise<SubmisiTugasView[]> {
  return apiFetch<SubmisiTugasView[]>(`/tugas/${tugasId}/submisi`);
}

export async function createTugasRequest(input: CreateTugasInput): Promise<Tugas> {
  return apiFetch<Tugas>("/tugas", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateTugasRequest(id: string, input: UpdateTugasInput): Promise<Tugas | null> {
  try {
    return await apiFetch<Tugas>(`/tugas/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  } catch {
    return null;
  }
}

export async function deleteTugasRequest(id: string): Promise<boolean> {
  return apiDelete(`/tugas/${id}`);
}

export async function submitTugasRequest(input: SubmitTugasInput): Promise<SubmisiTugas> {
  return apiFetch<SubmisiTugas>(`/tugas/${input.tugasId}/submit`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function beriNilaiTugasRequest(
  tugasId: string,
  submisiId: string,
  nilai: number
): Promise<SubmisiTugas> {
  return apiFetch<SubmisiTugas>(`/tugas/${tugasId}/submisi/${submisiId}/nilai`, {
    method: "PATCH",
    body: JSON.stringify({ nilai }),
  });
}

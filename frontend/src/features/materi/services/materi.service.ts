import type { Materi, MateriView, CreateMateriInput, UpdateMateriInput } from "../types/materi.types";
import { apiFetch, apiDelete } from "@/lib/api";

export async function fetchMateriByGuru(guruId: string): Promise<MateriView[]> {
  return apiFetch<MateriView[]>(`/materi?guruId=${guruId}`);
}

export async function fetchMateriForSiswa(siswaId: string): Promise<MateriView[]> {
  return apiFetch<MateriView[]>(`/materi?siswaId=${siswaId}`);
}

export async function fetchMateriById(id: string): Promise<MateriView | null> {
  try {
    return await apiFetch<MateriView>(`/materi/${id}`);
  } catch {
    return null;
  }
}

export async function createMateriRequest(input: CreateMateriInput): Promise<Materi> {
  return apiFetch<Materi>("/materi", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateMateriRequest(id: string, input: UpdateMateriInput): Promise<Materi | null> {
  try {
    return await apiFetch<Materi>(`/materi/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  } catch {
    return null;
  }
}

export async function deleteMateriRequest(id: string): Promise<boolean> {
  return apiDelete(`/materi/${id}`);
}

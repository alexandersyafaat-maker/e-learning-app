import type { Kelas, CreateKelasInput, UpdateKelasInput } from "../types/kelas.types";
import { apiFetch, apiDelete } from "@/lib/api";

const API_URL = process.env.API_URL ?? "http://localhost:8000/api";

// Public endpoint — no auth required (needed on register page pre-login)
export async function fetchKelasList(): Promise<Kelas[]> {
  const res = await fetch(`${API_URL}/kelas`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch kelas");
  const json = await res.json();
  return (json.data as Kelas[]) ?? [];
}

export async function fetchKelasById(id: string): Promise<Kelas | null> {
  try {
    return await apiFetch<Kelas>(`/kelas/${id}`);
  } catch {
    return null;
  }
}

export async function createKelasRequest(input: CreateKelasInput): Promise<Kelas> {
  return apiFetch<Kelas>("/kelas", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateKelasRequest(id: string, input: UpdateKelasInput): Promise<Kelas | null> {
  try {
    return await apiFetch<Kelas>(`/kelas/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  } catch {
    return null;
  }
}

export async function deleteKelasRequest(id: string): Promise<boolean> {
  return apiDelete(`/kelas/${id}`);
}

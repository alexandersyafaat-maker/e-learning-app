import type { Akun, CreateAkunInput, UpdateAkunInput } from "../types/akun.types";
import { apiFetch, apiDelete } from "@/lib/api";

export async function fetchAkunList(): Promise<Akun[]> {
  return apiFetch<Akun[]>("/akun");
}

export async function fetchAkunById(id: string): Promise<Akun | null> {
  try {
    return await apiFetch<Akun>(`/akun/${id}`);
  } catch {
    return null;
  }
}

export async function createAkunRequest(input: CreateAkunInput): Promise<Akun> {
  return apiFetch<Akun>("/akun", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateAkunRequest(id: string, input: UpdateAkunInput): Promise<Akun | null> {
  try {
    return await apiFetch<Akun>(`/akun/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  } catch {
    return null;
  }
}

export async function deleteAkunRequest(id: string): Promise<boolean> {
  return apiDelete(`/akun/${id}`);
}

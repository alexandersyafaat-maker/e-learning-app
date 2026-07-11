import { apiFetch } from "@/lib/api";
import type { PesanObrolan, SendPesanInput } from "../types/obrolan.types";

export async function fetchPesanByMateri(materiId: string): Promise<PesanObrolan[]> {
  return apiFetch<PesanObrolan[]>(`/obrolan?materiId=${materiId}`);
}

export async function sendPesanRequest(
  materiId: string,
  input: SendPesanInput
): Promise<PesanObrolan> {
  return apiFetch<PesanObrolan>("/obrolan", {
    method: "POST",
    body: JSON.stringify({ materiId, teks: input.teks }),
  });
}

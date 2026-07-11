import type {
  VocabCardView,
  VocabCardWithProgress,
  VocabCard,
  SRSProgress,
  CreateVocabInput,
} from "../types/vocab.types";
import { apiFetch, apiDelete } from "@/lib/api";

export async function fetchVocabByGuru(guruId: string): Promise<VocabCardView[]> {
  return apiFetch<VocabCardView[]>(`/vocab?guruId=${guruId}`);
}

// siswaId only — backend auto-resolves kelasId
export async function fetchCardsForReview(siswaId: string): Promise<VocabCardWithProgress[]> {
  return apiFetch<VocabCardWithProgress[]>(`/vocab/review?siswaId=${siswaId}`);
}

export async function createVocabRequest(input: CreateVocabInput): Promise<VocabCard> {
  return apiFetch<VocabCard>("/vocab", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function deleteVocabRequest(id: string): Promise<boolean> {
  return apiDelete(`/vocab/${id}`);
}

export async function updateSRSProgress(
  cardId: string,
  siswaId: string,
  quality: number
): Promise<SRSProgress> {
  return apiFetch<SRSProgress>("/vocab/review", {
    method: "POST",
    body: JSON.stringify({ cardId, siswaId, quality }),
  });
}

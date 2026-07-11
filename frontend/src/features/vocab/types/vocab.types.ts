import type { BaseEntity } from "@/lib/types";

export interface VocabCard extends BaseEntity {
  word: string;
  translation: string;
  definition: string;
  example: string;
  v1?: string;
  v2?: string;
  v3?: string;
  ving?: string;
  vs?: string;
  kelasId: string;
  guruId: string;
}

export interface SRSProgress extends BaseEntity {
  cardId: string;
  siswaId: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReviewAt: string;
  lastReviewAt?: string;
  lastQuality?: number;
}

export interface VocabCardView extends VocabCard {
  kelasNama: string;
  guruNama: string;
}

export interface VocabCardWithProgress extends VocabCardView {
  progress: SRSProgress | null;
  isDue: boolean;
  isNew: boolean;
}

export interface CreateVocabInput {
  word: string;
  translation: string;
  definition: string;
  example: string;
  v1?: string;
  v2?: string;
  v3?: string;
  ving?: string;
  vs?: string;
  kelasId: string;
  guruId: string;
}

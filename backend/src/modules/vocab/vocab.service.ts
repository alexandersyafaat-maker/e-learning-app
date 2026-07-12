import { AppError } from '@/utils/AppError';
import { findKelasById } from '@/modules/kelas/kelas.repository';
import { findKelasIdBySiswaId } from '@/modules/akun/akun.repository';
import {
  CreateVocabInput,
  ReviewInput,
  VocabQuery,
  ReviewQuery,
} from '@/modules/vocab/vocab.types';
import {
  findCardList,
  findCardById,
  createCard,
  deleteCardById,
  findProgressByCard,
  upsertProgress,
  findCardsWithProgress,
} from '@/modules/vocab/vocab.repository';

// ── SM-2 ──────────────────────────────────────────────────

function sm2(
  quality: number,
  prev: { interval: number; easeFactor: number; repetitions: number },
): { interval: number; easeFactor: number; repetitions: number } {
  // Update EF regardless of quality
  const newEF = Math.max(
    1.3,
    prev.easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02),
  );

  if (quality < 3) {
    // Incorrect — reset streak, review again tomorrow
    return { interval: 1, easeFactor: newEF, repetitions: 0 };
  }

  // Correct — grow interval
  let newInterval: number;
  if (prev.repetitions === 0) {
    newInterval = 1;
  } else if (prev.repetitions === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(prev.interval * newEF);
  }

  return { interval: newInterval, easeFactor: newEF, repetitions: prev.repetitions + 1 };
}

// ── Guru ──────────────────────────────────────────────────

export async function listVocabService(query: VocabQuery) {
  return findCardList(query);
}

export async function createVocabService(input: CreateVocabInput, actorGuruId: string) {
  if (input.guruId !== actorGuruId) throw AppError.forbidden();

  const kelas = await findKelasById(input.kelasId);
  if (!kelas) throw AppError.notFound('Kelas');

  const doc = await createCard({
    word: input.word,
    translation: input.translation,
    definition: input.definition,
    example: input.example,
    v1: input.v1,
    v2: input.v2,
    v3: input.v3,
    ving: input.ving,
    vs: input.vs,
    kelasId: input.kelasId,
    guruId: input.guruId,
  });

  return doc.toJSON();
}

export async function deleteVocabService(id: string, actorGuruId: string): Promise<void> {
  const card = await findCardById(id);
  if (!card) throw AppError.notFound('VocabCard');
  if (card.guruId !== actorGuruId) throw AppError.forbidden();
  await deleteCardById(id);
}

// ── Siswa ─────────────────────────────────────────────────

export async function getReviewQueueService(query: ReviewQuery) {
  const kelasId = query.kelasId ?? (await findKelasIdBySiswaId(query.siswaId));
  if (!kelasId) throw AppError.badRequest('Siswa belum terdaftar di kelas');
  return findCardsWithProgress(kelasId, query.siswaId);
}

export async function submitReviewService(input: ReviewInput, actorSiswaId: string) {
  if (input.siswaId !== actorSiswaId) throw AppError.forbidden();

  const card = await findCardById(input.cardId);
  if (!card) throw AppError.notFound('VocabCard');

  const existingProgress = await findProgressByCard(input.cardId, input.siswaId);

  const prev = existingProgress
    ? {
        interval: existingProgress.interval,
        easeFactor: existingProgress.easeFactor,
        repetitions: existingProgress.repetitions,
      }
    : { interval: 1, easeFactor: 2.5, repetitions: 0 };

  const result = sm2(input.quality, prev);

  const now = new Date();
  const nextReviewAt = new Date(now.getTime() + result.interval * 86_400_000);

  const progress = await upsertProgress(input.cardId, input.siswaId, {
    interval: result.interval,
    easeFactor: result.easeFactor,
    repetitions: result.repetitions,
    nextReviewAt,
    lastReviewAt: now,
    lastQuality: input.quality,
  });

  return progress.toJSON();
}

import type {
  VocabCard,
  VocabCardView,
  VocabCardWithProgress,
  SRSProgress,
  CreateVocabInput,
} from "../types/vocab.types";
import { applySM2 } from "../utils/sm2";

const KELAS_NAMA_MAP: Record<string, string> = {
  "k-001": "Kelas VII",
  "k-002": "Kelas VIII",
  "k-003": "Kelas IX",
};

const GURU_NAMA_MAP: Record<string, string> = {
  "u-002": "Pak Ahmad",
  "u-003": "Bu Sari",
};

const SISWA_KELAS_MAP: Record<string, string> = {
  "u-004": "k-001",
  "u-005": "k-002",
  "u-006": "k-003",
};

let DUMMY_VOCAB_CARDS: VocabCard[] = [
  {
    id: "vc-001",
    word: "run",
    translation: "berlari; berjalan cepat",
    definition: "to move at a speed faster than a walk, or to operate / manage something",
    example: "She runs 5 km every morning before school.",
    v1: "run", v2: "ran", v3: "run", ving: "running", vs: "runs",
    kelasId: "k-001",
    guruId: "u-002",
    createdAt: "2026-02-01T08:00:00.000Z",
    updatedAt: "2026-02-01T08:00:00.000Z",
  },
  {
    id: "vc-002",
    word: "accomplish",
    translation: "menyelesaikan; mencapai",
    definition: "to achieve or complete something successfully",
    example: "She accomplished all her goals before the deadline.",
    v1: "accomplish", v2: "accomplished", v3: "accomplished", ving: "accomplishing", vs: "accomplishes",
    kelasId: "k-001",
    guruId: "u-002",
    createdAt: "2026-02-02T08:00:00.000Z",
    updatedAt: "2026-02-02T08:00:00.000Z",
  },
  {
    id: "vc-003",
    word: "describe",
    translation: "menggambarkan; mendeskripsikan",
    definition: "to give a detailed spoken or written account of something",
    example: "Describe the main character in the story using three adjectives.",
    v1: "describe", v2: "described", v3: "described", ving: "describing", vs: "describes",
    kelasId: "k-001",
    guruId: "u-002",
    createdAt: "2026-02-03T08:00:00.000Z",
    updatedAt: "2026-02-03T08:00:00.000Z",
  },
  {
    id: "vc-004",
    word: "analyze",
    translation: "menganalisis; menelaah",
    definition: "to examine something in detail to understand it or explain it",
    example: "Analyze the data before drawing any conclusions.",
    v1: "analyze", v2: "analyzed", v3: "analyzed", ving: "analyzing", vs: "analyzes",
    kelasId: "k-001",
    guruId: "u-002",
    createdAt: "2026-02-04T08:00:00.000Z",
    updatedAt: "2026-02-04T08:00:00.000Z",
  },
  {
    id: "vc-005",
    word: "collaborate",
    translation: "berkolaborasi; bekerja sama",
    definition: "to work jointly with others toward a shared goal",
    example: "Students collaborate on group projects every Friday.",
    v1: "collaborate", v2: "collaborated", v3: "collaborated", ving: "collaborating", vs: "collaborates",
    kelasId: "k-001",
    guruId: "u-002",
    createdAt: "2026-02-05T08:00:00.000Z",
    updatedAt: "2026-02-05T08:00:00.000Z",
  },
  {
    id: "vc-006",
    word: "evaluate",
    translation: "mengevaluasi; menilai",
    definition: "to form an idea of the amount, quality, or value of something",
    example: "The teacher will evaluate your presentation next week.",
    v1: "evaluate", v2: "evaluated", v3: "evaluated", ving: "evaluating", vs: "evaluates",
    kelasId: "k-001",
    guruId: "u-002",
    createdAt: "2026-02-06T08:00:00.000Z",
    updatedAt: "2026-02-06T08:00:00.000Z",
  },
  {
    id: "vc-007",
    word: "persuade",
    translation: "membujuk; meyakinkan",
    definition: "to cause someone to do or believe something through reasoning or argument",
    example: "He tried to persuade her to join the debate team.",
    v1: "persuade", v2: "persuaded", v3: "persuaded", ving: "persuading", vs: "persuades",
    kelasId: "k-002",
    guruId: "u-003",
    createdAt: "2026-02-07T08:00:00.000Z",
    updatedAt: "2026-02-07T08:00:00.000Z",
  },
  {
    id: "vc-008",
    word: "demonstrate",
    translation: "mendemonstrasikan; memperlihatkan",
    definition: "to show how something works or is done",
    example: "The teacher demonstrated the experiment step by step.",
    v1: "demonstrate", v2: "demonstrated", v3: "demonstrated", ving: "demonstrating", vs: "demonstrates",
    kelasId: "k-002",
    guruId: "u-003",
    createdAt: "2026-02-08T08:00:00.000Z",
    updatedAt: "2026-02-08T08:00:00.000Z",
  },
  {
    id: "vc-009",
    word: "summarize",
    translation: "meringkas; merangkum",
    definition: "to give a brief statement of the main points of something",
    example: "Please summarize the article in two paragraphs.",
    v1: "summarize", v2: "summarized", v3: "summarized", ving: "summarizing", vs: "summarizes",
    kelasId: "k-002",
    guruId: "u-003",
    createdAt: "2026-02-09T08:00:00.000Z",
    updatedAt: "2026-02-09T08:00:00.000Z",
  },
];

// SRS progress per siswa per card
let DUMMY_SRS_PROGRESS: SRSProgress[] = [
  {
    id: "sp-001",
    cardId: "vc-001",
    siswaId: "u-004",
    interval: 2,
    easeFactor: 2.5,
    repetitions: 2,
    nextReviewAt: "2026-06-25T00:00:00.000Z", // overdue
    lastReviewAt: "2026-06-23T10:00:00.000Z",
    lastQuality: 4,
    createdAt: "2026-06-20T08:00:00.000Z",
    updatedAt: "2026-06-23T10:00:00.000Z",
  },
  {
    id: "sp-002",
    cardId: "vc-002",
    siswaId: "u-004",
    interval: 1,
    easeFactor: 2.3,
    repetitions: 1,
    nextReviewAt: "2026-06-26T00:00:00.000Z", // due today
    lastReviewAt: "2026-06-25T09:00:00.000Z",
    lastQuality: 3,
    createdAt: "2026-06-24T08:00:00.000Z",
    updatedAt: "2026-06-25T09:00:00.000Z",
  },
  {
    id: "sp-003",
    cardId: "vc-003",
    siswaId: "u-004",
    interval: 6,
    easeFactor: 2.6,
    repetitions: 3,
    nextReviewAt: "2026-07-02T00:00:00.000Z", // future — not due
    lastReviewAt: "2026-06-26T08:00:00.000Z",
    lastQuality: 5,
    createdAt: "2026-06-15T08:00:00.000Z",
    updatedAt: "2026-06-26T08:00:00.000Z",
  },
];

let nextCardId = 10;
let nextProgressId = 4;

function toView(card: VocabCard): VocabCardView {
  return {
    ...card,
    kelasNama: KELAS_NAMA_MAP[card.kelasId] ?? card.kelasId,
    guruNama: GURU_NAMA_MAP[card.guruId] ?? card.guruId,
  };
}

function isDueNow(nextReviewAt: string): boolean {
  return new Date(nextReviewAt) <= new Date();
}

export async function fetchVocabByGuru(guruId: string): Promise<VocabCardView[]> {
  return DUMMY_VOCAB_CARDS.filter((c) => c.guruId === guruId).map(toView);
}

export async function fetchCardsForReview(siswaId: string): Promise<VocabCardWithProgress[]> {
  const kelasId = SISWA_KELAS_MAP[siswaId];
  if (!kelasId) return [];

  const cards = DUMMY_VOCAB_CARDS.filter((c) => c.kelasId === kelasId);

  return cards.map((card) => {
    const progress = DUMMY_SRS_PROGRESS.find(
      (p) => p.cardId === card.id && p.siswaId === siswaId
    ) ?? null;

    const isNew = !progress;
    const isDue = progress ? isDueNow(progress.nextReviewAt) : true;

    return { ...toView(card), progress, isDue, isNew };
  }).filter((c) => c.isDue || c.isNew);
}

export async function fetchVocabById(id: string): Promise<VocabCard | null> {
  return DUMMY_VOCAB_CARDS.find((c) => c.id === id) ?? null;
}

export async function createVocabRequest(input: CreateVocabInput): Promise<VocabCard> {
  const now = new Date().toISOString();
  const card: VocabCard = {
    id: `vc-${String(nextCardId++).padStart(3, "0")}`,
    ...input,
    createdAt: now,
    updatedAt: now,
  };
  DUMMY_VOCAB_CARDS.push(card);
  return card;
}

export async function deleteVocabRequest(id: string): Promise<boolean> {
  const before = DUMMY_VOCAB_CARDS.length;
  DUMMY_VOCAB_CARDS = DUMMY_VOCAB_CARDS.filter((c) => c.id !== id);
  return DUMMY_VOCAB_CARDS.length < before;
}

export async function updateSRSProgress(
  cardId: string,
  siswaId: string,
  quality: number
): Promise<SRSProgress> {
  const existing = DUMMY_SRS_PROGRESS.find(
    (p) => p.cardId === cardId && p.siswaId === siswaId
  );

  const sm2Result = applySM2(existing ?? null, quality);
  const now = new Date().toISOString();

  if (existing) {
    const updated: SRSProgress = {
      ...existing,
      ...sm2Result,
      lastQuality: quality,
      updatedAt: now,
    };
    DUMMY_SRS_PROGRESS = DUMMY_SRS_PROGRESS.map((p) =>
      p.id === existing.id ? updated : p
    );
    return updated;
  }

  const created: SRSProgress = {
    id: `sp-${String(nextProgressId++).padStart(3, "0")}`,
    cardId,
    siswaId,
    ...sm2Result,
    lastQuality: quality,
    createdAt: now,
    updatedAt: now,
  };
  DUMMY_SRS_PROGRESS.push(created);
  return created;
}

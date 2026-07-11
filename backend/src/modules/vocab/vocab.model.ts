import { Schema, model, HydratedDocument } from 'mongoose';
import { uuidId, baseSchemaOptions } from '@/utils/mongoose';

// ── VocabCard ─────────────────────────────────────────────

export interface IVocabCard {
  _id: string;
  id: string;
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
  createdAt: Date;
  updatedAt: Date;
}

export type VocabCardDocument = HydratedDocument<IVocabCard>;

const vocabCardSchema = new Schema<IVocabCard>(
  {
    _id: uuidId,
    word: { type: String, required: true, trim: true },
    translation: { type: String, required: true },
    definition: { type: String, required: true },
    example: { type: String, required: true },
    v1: { type: String },
    v2: { type: String },
    v3: { type: String },
    ving: { type: String },
    vs: { type: String },
    kelasId: { type: String, required: true },
    guruId: { type: String, required: true },
  },
  baseSchemaOptions,
);

vocabCardSchema.index({ guruId: 1 });
vocabCardSchema.index({ kelasId: 1 });

export const VocabCardModel = model<IVocabCard>('VocabCard', vocabCardSchema);

// ── SRSProgress ───────────────────────────────────────────

export interface ISRSProgress {
  _id: string;
  id: string;
  cardId: string;
  siswaId: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReviewAt: Date;
  lastReviewAt?: Date;
  lastQuality?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type SRSProgressDocument = HydratedDocument<ISRSProgress>;

const srsProgressSchema = new Schema<ISRSProgress>(
  {
    _id: uuidId,
    cardId: { type: String, required: true },
    siswaId: { type: String, required: true },
    interval: { type: Number, required: true, default: 1 },
    easeFactor: { type: Number, required: true, default: 2.5 },
    repetitions: { type: Number, required: true, default: 0 },
    nextReviewAt: { type: Date, required: true },
    lastReviewAt: { type: Date },
    lastQuality: { type: Number, min: 0, max: 5 },
  },
  baseSchemaOptions,
);

srsProgressSchema.index({ siswaId: 1 });
srsProgressSchema.index({ cardId: 1, siswaId: 1 }, { unique: true });

export const SRSProgressModel = model<ISRSProgress>('SRSProgress', srsProgressSchema);

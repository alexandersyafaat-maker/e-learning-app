import { z } from 'zod';

export const CreateVocabSchema = z.object({
  word: z.string().min(1, 'Word wajib diisi').trim(),
  translation: z.string().min(1, 'Translation wajib diisi'),
  definition: z.string().min(1, 'Definition wajib diisi'),
  example: z.string().min(1, 'Example wajib diisi'),
  v1: z.string().optional(),
  v2: z.string().optional(),
  v3: z.string().optional(),
  ving: z.string().optional(),
  vs: z.string().optional(),
  kelasId: z.string().uuid('kelasId tidak valid'),
  guruId: z.string().uuid('guruId tidak valid'),
});

export const ReviewSchema = z.object({
  cardId: z.string().uuid('cardId tidak valid'),
  siswaId: z.string().uuid('siswaId tidak valid'),
  quality: z.number().int().min(0).max(5),
});

export const VocabQuerySchema = z.object({
  guruId: z.string().uuid().optional(),
  kelasId: z.string().uuid().optional(),
});

export const ReviewQuerySchema = z.object({
  siswaId: z.string().uuid('siswaId tidak valid'),
  kelasId: z.string().uuid().optional(), // optional: auto-resolved from user.kelasId if absent
});

export type CreateVocabInput = z.infer<typeof CreateVocabSchema>;
export type ReviewInput = z.infer<typeof ReviewSchema>;
export type VocabQuery = z.infer<typeof VocabQuerySchema>;
export type ReviewQuery = z.infer<typeof ReviewQuerySchema>;

import { z } from 'zod';

export const LampiranSchema = z.object({
  id: z.string().uuid(),
  nama: z.string().min(1),
  ukuran: z.number().int().nonnegative(),
  tipe: z.string().min(1),
  url: z.string().url(),
});

export const CreateMateriSchema = z.object({
  judul: z.string().min(1, 'Judul wajib diisi').trim(),
  konten: z.string().min(1, 'Konten wajib diisi'),
  kelasId: z.string().uuid('kelasId tidak valid'),
  guruId: z.string().uuid('guruId tidak valid'),
  lampiran: z.array(LampiranSchema).default([]),
});

export const UpdateMateriSchema = z.object({
  judul: z.string().min(1, 'Judul wajib diisi').trim(),
  konten: z.string().min(1, 'Konten wajib diisi'),
  kelasId: z.string().uuid('kelasId tidak valid'),
  lampiran: z.array(LampiranSchema).default([]),
});

export const MateriQuerySchema = z.object({
  guruId: z.string().uuid().optional(),
  kelasId: z.string().uuid().optional(),
  siswaId: z.string().uuid().optional(),
});

export type LampiranInput = z.infer<typeof LampiranSchema>;
export type CreateMateriInput = z.infer<typeof CreateMateriSchema>;
export type UpdateMateriInput = z.infer<typeof UpdateMateriSchema>;
export type MateriQuery = z.infer<typeof MateriQuerySchema>;

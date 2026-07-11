import { z } from 'zod';
import { LampiranSchema } from '@/modules/materi/materi.types';

export const CreateLatihanSchema = z.object({
  judul: z.string().min(1, 'Judul wajib diisi').trim(),
  deskripsi: z.string().min(1, 'Deskripsi wajib diisi'),
  kelasId: z.string().uuid('kelasId tidak valid'),
  guruId: z.string().uuid('guruId tidak valid'),
  deadline: z.string().datetime({ message: 'Deadline harus ISO 8601' }).optional(),
  lampiran: z.array(LampiranSchema).default([]),
});

export const UpdateLatihanSchema = z.object({
  judul: z.string().min(1, 'Judul wajib diisi').trim(),
  deskripsi: z.string().min(1, 'Deskripsi wajib diisi'),
  kelasId: z.string().uuid('kelasId tidak valid'),
  deadline: z.string().datetime({ message: 'Deadline harus ISO 8601' }).optional(),
  lampiran: z.array(LampiranSchema).default([]),
});

export const SubmitLatihanSchema = z.object({
  siswaId: z.string().uuid('siswaId tidak valid'),
  jawaban: z.string().min(1, 'Jawaban wajib diisi'),
  lampiran: z.array(LampiranSchema).default([]),
});

export const NilaiSchema = z.object({
  nilai: z.number().min(0, 'Nilai minimal 0').max(100, 'Nilai maksimal 100'),
});

export const LatihanQuerySchema = z.object({
  guruId: z.string().uuid().optional(),
  kelasId: z.string().uuid().optional(),
  siswaId: z.string().uuid().optional(),
});

export type CreateLatihanInput = z.infer<typeof CreateLatihanSchema>;
export type UpdateLatihanInput = z.infer<typeof UpdateLatihanSchema>;
export type SubmitLatihanInput = z.infer<typeof SubmitLatihanSchema>;
export type NilaiInput = z.infer<typeof NilaiSchema>;
export type LatihanQuery = z.infer<typeof LatihanQuerySchema>;

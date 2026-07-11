import { z } from 'zod';
import { LampiranSchema } from '@/modules/materi/materi.types';

export const CreateTugasSchema = z.object({
  judul: z.string().min(1, 'Judul wajib diisi').trim(),
  deskripsi: z.string().min(1, 'Deskripsi wajib diisi'),
  kelasId: z.string().uuid('kelasId tidak valid'),
  guruId: z.string().uuid('guruId tidak valid'),
  deadline: z.string().datetime({ message: 'Deadline harus ISO 8601' }).optional(),
  lampiran: z.array(LampiranSchema).default([]),
});

export const UpdateTugasSchema = z.object({
  judul: z.string().min(1, 'Judul wajib diisi').trim(),
  deskripsi: z.string().min(1, 'Deskripsi wajib diisi'),
  kelasId: z.string().uuid('kelasId tidak valid'),
  deadline: z.string().datetime({ message: 'Deadline harus ISO 8601' }).optional(),
  lampiran: z.array(LampiranSchema).default([]),
});

export const SubmitTugasSchema = z.object({
  siswaId: z.string().uuid('siswaId tidak valid'),
  jawaban: z.string().min(1, 'Jawaban wajib diisi'),
  catatan: z.string().default(''),
  lampiran: z.array(LampiranSchema).default([]),
});

export const NilaiTugasSchema = z.object({
  nilai: z.number().min(0, 'Nilai minimal 0').max(100, 'Nilai maksimal 100'),
});

export const TugasQuerySchema = z.object({
  guruId: z.string().uuid().optional(),
  kelasId: z.string().uuid().optional(),
  siswaId: z.string().uuid().optional(),
});

export type CreateTugasInput = z.infer<typeof CreateTugasSchema>;
export type UpdateTugasInput = z.infer<typeof UpdateTugasSchema>;
export type SubmitTugasInput = z.infer<typeof SubmitTugasSchema>;
export type NilaiTugasInput = z.infer<typeof NilaiTugasSchema>;
export type TugasQuery = z.infer<typeof TugasQuerySchema>;

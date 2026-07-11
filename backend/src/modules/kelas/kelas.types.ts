import { z } from 'zod';

export const CreateKelasSchema = z.object({
  nama: z.string().min(1, 'Nama wajib diisi').trim(),
  tingkat: z.string().min(1, 'Tingkat wajib diisi').trim(),
  tahunAjaran: z.string().min(1, 'Tahun ajaran wajib diisi').trim(),
  deskripsi: z.string().trim().optional(),
});

export const UpdateKelasSchema = CreateKelasSchema;

export type CreateKelasInput = z.infer<typeof CreateKelasSchema>;
export type UpdateKelasInput = z.infer<typeof UpdateKelasSchema>;

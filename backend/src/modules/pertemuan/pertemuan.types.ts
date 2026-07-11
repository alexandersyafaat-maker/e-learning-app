import { z } from 'zod';

export const CreatePertemuanSchema = z.object({
  judul: z.string().min(1, 'Judul wajib diisi').trim(),
  kelasId: z.string().uuid('kelasId tidak valid'),
  guruId: z.string().uuid('guruId tidak valid'),
  jadwal: z.string().datetime({ message: 'Jadwal harus ISO 8601' }),
  durasi: z.number().int().min(1, 'Durasi minimal 1 menit'),
});

export const PertemuanQuerySchema = z.object({
  guruId: z.string().uuid().optional(),
  kelasId: z.string().uuid().optional(),
  siswaId: z.string().uuid().optional(),
});

export type CreatePertemuanInput = z.infer<typeof CreatePertemuanSchema>;
export type PertemuanQuery = z.infer<typeof PertemuanQuerySchema>;

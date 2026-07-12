import { z } from 'zod';

export const SendPesanSchema = z.object({
  materiId: z.string().min(1, 'materiId wajib diisi'),
  teks: z
    .string()
    .min(1, 'Pesan tidak boleh kosong')
    .max(1000, 'Pesan terlalu panjang (maks 1000 karakter)')
    .trim(),
});

export const ObrolanQuerySchema = z.object({
  materiId: z.string().min(1, 'materiId wajib diisi'),
});

export type SendPesanInput = z.infer<typeof SendPesanSchema>;
export type ObrolanQuery = z.infer<typeof ObrolanQuerySchema>;

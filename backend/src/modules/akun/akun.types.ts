import { z } from 'zod';
import { ROLES } from '@/modules/auth/user.model';

export const CreateAkunSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').trim(),
  email: z.string().email('Email tidak valid').trim(),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  role: z.enum(ROLES, { errorMap: () => ({ message: 'Role tidak valid' }) }),
  nisn: z
    .string()
    .regex(/^\d{10}$/, 'NISN harus 10 digit angka')
    .optional(),
  nik: z
    .string()
    .regex(/^\d{16}$/, 'NIK harus 16 digit angka')
    .optional(),
  kelasId: z.string().uuid('kelasId tidak valid').optional(),
});

export const UpdateAkunSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').trim(),
  email: z.string().email('Email tidak valid').trim(),
  password: z.string().min(6, 'Password minimal 6 karakter').optional().or(z.literal('')),
  role: z.enum(ROLES, { errorMap: () => ({ message: 'Role tidak valid' }) }),
  nisn: z
    .string()
    .regex(/^\d{10}$/, 'NISN harus 10 digit angka')
    .optional(),
  nik: z
    .string()
    .regex(/^\d{16}$/, 'NIK harus 16 digit angka')
    .optional(),
  kelasId: z.string().uuid('kelasId tidak valid').optional(),
});

export type CreateAkunInput = z.infer<typeof CreateAkunSchema>;
export type UpdateAkunInput = z.infer<typeof UpdateAkunSchema>;

import { z } from 'zod';
import { Role } from '@/modules/auth/user.model';

export const LoginSchema = z.object({
  identifier: z.string().min(1, 'NISN / NIK / Email wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  role: z.enum(['GURU', 'SISWA'] as const, { message: 'Role tidak valid' }),
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

export type RegisterInput = z.infer<typeof RegisterSchema>;

export interface JwtPayload {
  userId: string;
  role: Role;
  name: string;
  email: string;
  kelasId?: string;
  nisn?: string;
  nik?: string;
}

export interface Session {
  userId: string;
  role: Role;
  name: string;
  email: string;
  kelasId?: string;
  nisn?: string;
  nik?: string;
  avatarUrl?: string;
}

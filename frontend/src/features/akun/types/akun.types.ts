import type { BaseEntity } from "@/lib/types";
import { Role } from "@/features/auth/types/auth.types";

export type { Role };

export interface Akun extends BaseEntity {
  name: string;
  email: string;
  role: Role;
  nisn?: string;
  nik?: string;
  kelasId?: string;
}

export interface CreateAkunInput {
  name: string;
  email: string;
  password: string;
  role: Role;
  nisn?: string;
  nik?: string;
  kelasId?: string;
}

export interface UpdateAkunInput {
  name: string;
  email: string;
  password?: string;
  role: Role;
  nisn?: string;
  nik?: string;
  kelasId?: string;
}

import type { BaseEntity } from "@/lib/types";

export enum Role {
  ADMIN = "ADMIN",
  GURU = "GURU",
  SISWA = "SISWA",
}

export interface User extends BaseEntity {
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
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

export interface LoginInput {
  email: string;
  password: string;
}

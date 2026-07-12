import { Schema, model, HydratedDocument } from 'mongoose';
import { uuidId, baseSchemaOptions } from '@/utils/mongoose';

export const ROLES = ['ADMIN', 'GURU', 'SISWA'] as const;
export type Role = (typeof ROLES)[number];

export interface IUser {
  _id: string;
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  nisn?: string; // siswa only — 10-digit student ID
  nik?: string; // guru only  — 16-digit national ID
  avatarUrl?: string;
  kelasId?: string; // siswa only
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<IUser>;

const userSchema = new Schema<IUser>(
  {
    _id: uuidId,
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ROLES, required: true },
    nisn: { type: String, sparse: true, unique: true, trim: true },
    nik: { type: String, sparse: true, unique: true, trim: true },
    avatarUrl: { type: String },
    kelasId: { type: String },
  },
  baseSchemaOptions,
);

export const UserModel = model<IUser>('User', userSchema);

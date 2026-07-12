import { AppError } from '@/utils/AppError';
import { comparePassword, hashPassword } from '@/utils/password';
import { signAccessToken, JwtPayload } from '@/utils/jwt';
import {
  findByEmail,
  findByIdentifier,
  findById,
  createAuthUser,
  updateAvatar as updateAvatarRepo,
} from '@/modules/auth/auth.repository';
import { deleteUploadedFile } from '@/middlewares/upload.middleware';
import { LoginInput, RegisterInput, Session } from '@/modules/auth/auth.types';

export async function login(input: LoginInput): Promise<{ token: string; user: Session }> {
  const user = await findByIdentifier(input.identifier);
  if (!user) throw AppError.invalidCredentials();

  const valid = await comparePassword(input.password, user.password);
  if (!valid) throw AppError.invalidCredentials();

  const payload: JwtPayload = {
    userId: user.id as string,
    role: user.role,
    name: user.name,
    email: user.email,
    kelasId: user.kelasId,
    nisn: user.nisn,
    nik: user.nik,
  };

  const token = signAccessToken(payload);
  const session: Session = payload;

  return { token, user: session };
}

export async function register(input: RegisterInput): Promise<{ token: string; user: Session }> {
  const existing = await findByEmail(input.email);
  if (existing) throw AppError.conflict('Email sudah digunakan');

  const hashed = await hashPassword(input.password);
  const user = await createAuthUser({
    name: input.name,
    email: input.email,
    password: hashed,
    role: input.role,
    kelasId: input.kelasId,
    nisn: input.nisn,
    nik: input.nik,
  });

  const payload: JwtPayload = {
    userId: user.id as string,
    role: user.role,
    name: user.name,
    email: user.email,
    kelasId: user.kelasId,
    nisn: user.nisn,
    nik: user.nik,
  };

  const token = signAccessToken(payload);
  return { token, user: payload };
}

export async function getSessionById(userId: string): Promise<Session> {
  const user = await findById(userId);
  if (!user) throw AppError.unauthorized('Akun tidak ditemukan');

  return {
    userId: user.id as string,
    role: user.role,
    name: user.name,
    email: user.email,
    kelasId: user.kelasId,
    nisn: user.nisn,
    nik: user.nik,
    avatarUrl: user.avatarUrl,
  };
}

export async function updateAvatar(userId: string, avatarUrl: string): Promise<Session> {
  const user = await findById(userId);
  if (!user) throw AppError.unauthorized('Akun tidak ditemukan');

  const updated = await updateAvatarRepo(userId, avatarUrl);
  if (!updated) throw AppError.unauthorized('Akun tidak ditemukan');

  if (user.avatarUrl) {
    await deleteUploadedFile(user.avatarUrl);
  }

  return {
    userId: updated.id as string,
    role: updated.role,
    name: updated.name,
    email: updated.email,
    kelasId: updated.kelasId,
    nisn: updated.nisn,
    nik: updated.nik,
    avatarUrl: updated.avatarUrl,
  };
}

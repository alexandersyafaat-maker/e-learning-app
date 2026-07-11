import { Request, Response } from 'express';
import { sendSuccess, sendNoContent } from '@/utils/response';
import { asyncHandler } from '@/middlewares/async-handler';
import { login, register, getSessionById, updateAvatar } from '@/modules/auth/auth.service';
import { LoginInput, RegisterInput } from '@/modules/auth/auth.types';
import { isProd } from '@/config/env';

const COOKIE_NAME = 'token';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7d

export const loginController = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as LoginInput;
  const { token, user } = await login(input);

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    signed: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: COOKIE_MAX_AGE,
  });

  sendSuccess(res, { user, token }, 200, 'Login berhasil');
});

export const registerController = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as RegisterInput;
  const { token, user } = await register(input);

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    signed: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: COOKIE_MAX_AGE,
  });

  sendSuccess(res, { user, token }, 201, 'Registrasi berhasil');
});

export const logoutController = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAME);
  sendNoContent(res);
});

export const meController = asyncHandler(async (req: Request, res: Response) => {
  const session = await getSessionById(req.user!.userId);
  sendSuccess(res, session);
});

export const uploadAvatarController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    sendSuccess(res, null, 400, 'File tidak ditemukan');
    return;
  }
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const avatarUrl = `${baseUrl}/uploads/${req.file.filename}`;
  const session = await updateAvatar(req.user!.userId, avatarUrl);
  sendSuccess(res, session, 200, 'Foto profil berhasil diperbarui');
});

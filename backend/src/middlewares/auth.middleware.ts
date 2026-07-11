import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils/AppError';
import { verifyAccessToken } from '@/utils/jwt';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const token = extractToken(req);
    if (!token) {
      next(AppError.unauthorized('Token tidak ditemukan'));
      return;
    }
    const payload = verifyAccessToken(token);
    req.user = {
      userId: payload.userId,
      role: payload.role,
      name: payload.name,
      email: payload.email,
      kelasId: payload.kelasId,
    };
    next();
  } catch {
    // JsonWebTokenError / TokenExpiredError bubbles to error.middleware
    next(AppError.unauthorized('Token tidak valid'));
  }
}

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  // signed cookie set during login
  const cookie = req.signedCookies as Record<string, string | undefined>;
  return cookie['token'] ?? null;
}

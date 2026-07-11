import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { AppError } from '@/utils/AppError';
import { sendError } from '@/utils/response';
import { ERROR_CODES } from '@/constants/error-codes';
import { logger } from '@/config/logger';

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // ── AppError (operational) ────────────────────────────────
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.code, err.message, err.errors);
    return;
  }

  // ── JWT errors ────────────────────────────────────────────
  if (err instanceof TokenExpiredError) {
    sendError(res, 401, ERROR_CODES.TOKEN_EXPIRED, 'Token expired');
    return;
  }

  if (err instanceof JsonWebTokenError) {
    sendError(res, 401, ERROR_CODES.INVALID_TOKEN, 'Invalid token');
    return;
  }

  // ── Mongoose errors ───────────────────────────────────────
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.fromEntries(
      Object.entries(err.errors).map(([key, val]) => [key, val.message]),
    );
    sendError(res, 400, ERROR_CODES.VALIDATION_ERROR, 'Validation failed', errors);
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    sendError(res, 400, ERROR_CODES.BAD_REQUEST, `Format ${err.path} tidak valid`);
    return;
  }

  // MongoDB duplicate key (code 11000)
  if (isMongoServerError(err) && err.code === 11000) {
    const fields = Object.keys(err.keyPattern ?? {}).join(', ');
    sendError(res, 409, ERROR_CODES.ALREADY_EXISTS, `${fields} sudah digunakan`);
    return;
  }

  // ── Unknown / programmer errors ───────────────────────────
  logger.error('Unhandled error', { err });
  sendError(res, 500, ERROR_CODES.INTERNAL_ERROR, 'Internal server error');
}

function isMongoServerError(err: unknown): err is { code: number; keyPattern: Record<string, unknown> } {
  return typeof err === 'object' && err !== null && 'code' in err && 'keyPattern' in err;
}

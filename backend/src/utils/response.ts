import { Response } from 'express';
import { ErrorCode } from '@/constants/error-codes';

// ── Types ────────────────────────────────────────────────────────────────────

export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  code: ErrorCode;
  error: string;
  errors?: Record<string, string>;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// ── Helpers ──────────────────────────────────────────────────────────────────

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  message?: string,
): Response {
  const body: SuccessResponse<T> = { success: true, data };
  if (message) body.message = message;
  return res.status(statusCode).json(body);
}

export function sendCreated<T>(res: Response, data: T, message?: string): Response {
  return sendSuccess(res, data, 201, message);
}

export function sendNoContent(res: Response): Response {
  return res.status(204).send();
}

export function sendError(
  res: Response,
  statusCode: number,
  code: ErrorCode,
  error: string,
  errors?: Record<string, string>,
): Response {
  const body: ErrorResponse = { success: false, code, error };
  if (errors && Object.keys(errors).length > 0) body.errors = errors;
  return res.status(statusCode).json(body);
}

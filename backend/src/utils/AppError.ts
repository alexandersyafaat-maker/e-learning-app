import { ERROR_CODES, ErrorCode } from '@/constants/error-codes';

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode;
  readonly errors?: Record<string, string>;
  readonly isOperational: boolean = true;

  constructor(
    message: string,
    statusCode: number,
    code: ErrorCode,
    errors?: Record<string, string>,
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }

  // ── 400 ──────────────────────────────────────────────────
  static badRequest(message: string, errors?: Record<string, string>) {
    return new AppError(message, 400, ERROR_CODES.BAD_REQUEST, errors);
  }

  static validation(errors: Record<string, string>, message = 'Validation failed') {
    return new AppError(message, 400, ERROR_CODES.VALIDATION_ERROR, errors);
  }

  // ── 401 ──────────────────────────────────────────────────
  static unauthorized(message = 'Unauthorized') {
    return new AppError(message, 401, ERROR_CODES.UNAUTHORIZED);
  }

  static invalidCredentials(message = 'Email atau password salah') {
    return new AppError(message, 401, ERROR_CODES.INVALID_CREDENTIALS);
  }

  static tokenExpired(message = 'Token expired') {
    return new AppError(message, 401, ERROR_CODES.TOKEN_EXPIRED);
  }

  static invalidToken(message = 'Invalid token') {
    return new AppError(message, 401, ERROR_CODES.INVALID_TOKEN);
  }

  // ── 403 ──────────────────────────────────────────────────
  static forbidden(message = 'Access forbidden') {
    return new AppError(message, 403, ERROR_CODES.FORBIDDEN);
  }

  // ── 404 ──────────────────────────────────────────────────
  static notFound(resource = 'Resource') {
    return new AppError(`${resource} tidak ditemukan`, 404, ERROR_CODES.NOT_FOUND);
  }

  // ── 409 ──────────────────────────────────────────────────
  static alreadyExists(resource = 'Resource') {
    return new AppError(`${resource} sudah ada`, 409, ERROR_CODES.ALREADY_EXISTS);
  }

  static conflict(message: string) {
    return new AppError(message, 409, ERROR_CODES.CONFLICT);
  }

  // ── Domain ───────────────────────────────────────────────
  static deadlinePassed(message = 'Deadline sudah lewat') {
    return new AppError(message, 422, ERROR_CODES.DEADLINE_PASSED);
  }

  static alreadySubmitted(message = 'Sudah pernah submit') {
    return new AppError(message, 409, ERROR_CODES.ALREADY_SUBMITTED);
  }

  static notInClass(message = 'Siswa tidak terdaftar di kelas ini') {
    return new AppError(message, 403, ERROR_CODES.NOT_IN_CLASS);
  }

  // ── 500 ──────────────────────────────────────────────────
  static internal(message = 'Internal server error') {
    return new AppError(message, 500, ERROR_CODES.INTERNAL_ERROR);
  }

  static zoomError(message: string) {
    return new AppError(message, 502, ERROR_CODES.ZOOM_API_ERROR);
  }
}

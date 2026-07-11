import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env, isDev } from '@/config/env';
import { logger } from '@/config/logger';
import { errorMiddleware } from '@/middlewares/error.middleware';
import { sendError } from '@/utils/response';
import { ERROR_CODES } from '@/constants/error-codes';

import path from 'path';
import mongoose from 'mongoose';
import authRoutes from '@/modules/auth/auth.routes';
import akunRoutes from '@/modules/akun/akun.routes';
import kelasRoutes from '@/modules/kelas/kelas.routes';
import materiRoutes from '@/modules/materi/materi.routes';
import latihanRoutes from '@/modules/latihan/latihan.routes';
import tugasRoutes from '@/modules/tugas/tugas.routes';
import pertemuanRoutes from '@/modules/pertemuan/pertemuan.routes';
import vocabRoutes from '@/modules/vocab/vocab.routes';
import obrolanRoutes from '@/modules/obrolan/obrolan.routes';

export function createApp(): Application {
  const app = express();

  // ── Security ──────────────────────────────────────────────
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGINS.split(',').map((o) => o.trim()),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: isDev ? 10_000 : 200,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, code: ERROR_CODES.BAD_REQUEST, error: 'Too many requests' },
    }),
  );

  // ── Body & parsing ────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser(env.COOKIE_SECRET));
  app.use(compression());

  // ── Logging ───────────────────────────────────────────────
  app.use(
    morgan(isDev ? 'dev' : 'combined', {
      stream: { write: (msg) => logger.http(msg.trim()) },
    }),
  );

  // ── Static uploads ────────────────────────────────────────
  // helmet's default Cross-Origin-Resource-Policy: same-origin blocks the
  // frontend (different origin/port) from loading these files in <img> tags.
  app.use(
    '/uploads',
    (_req: Request, res: Response, next: NextFunction) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      next();
    },
    express.static(path.resolve(process.cwd(), env.UPLOAD_DIR)),
  );

  // ── Health check ──────────────────────────────────────────
  app.get('/health', (_req: Request, res: Response) => {
    const dbState = mongoose.connection.readyState;
    const db = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';
    res.json({ success: true, data: { status: 'ok', env: env.NODE_ENV, db } });
  });

  // ── Routes ────────────────────────────────────────────────
  const router = express.Router();
  router.use('/auth', authRoutes);
  router.use('/akun', akunRoutes);
  router.use('/kelas', kelasRoutes);
  router.use('/materi', materiRoutes);
  router.use('/latihan', latihanRoutes);
  router.use('/tugas', tugasRoutes);
  router.use('/pertemuan', pertemuanRoutes);
  router.use('/vocab', vocabRoutes);
  router.use('/obrolan', obrolanRoutes);

  app.use(env.API_PREFIX, router);

  // ── 404 ───────────────────────────────────────────────────
  app.use((_req: Request, res: Response, _next: NextFunction) => {
    sendError(res, 404, ERROR_CODES.NOT_FOUND, 'Route tidak ditemukan');
  });

  // ── Global error handler (must be last) ───────────────────
  app.use(errorMiddleware);

  return app;
}

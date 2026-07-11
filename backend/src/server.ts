import '@/config/env'; // must be first — validates env at startup
import http from 'http';
import { createApp } from '@/app';
import { connectDatabase, disconnectDatabase } from '@/config/database';
import { env } from '@/config/env';
import { logger } from '@/config/logger';

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const app = createApp();
  const server = http.createServer(app);

  server.listen(env.PORT, () => {
    logger.info(`[server] Running on port ${env.PORT}`, {
      env: env.NODE_ENV,
      prefix: env.API_PREFIX,
    });
  });

  // ── Graceful shutdown ──────────────────────────────────────
  async function shutdown(signal: string): Promise<void> {
    logger.info(`[server] ${signal} received — shutting down`);

    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });

    await disconnectDatabase();
    logger.info('[server] Shutdown complete');
    process.exit(0);
  }

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('[server] Unhandled rejection', { reason });
    process.exit(1);
  });

  process.on('uncaughtException', (err) => {
    logger.error('[server] Uncaught exception', { message: err.message, stack: err.stack });
    process.exit(1);
  });
}

void bootstrap();

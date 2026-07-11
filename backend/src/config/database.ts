import dns from 'dns';
import mongoose from 'mongoose';
import { env } from '@/config/env';
import { logger } from '@/config/logger';

const RECONNECT_INTERVAL_MS = 5000;

// Force public IPv4 DNS resolvers. System DNS may be IPv6-only / unreachable
// for Node's c-ares resolver, which breaks Atlas SRV (mongodb+srv) lookups
// with `querySrv ECONNREFUSED`. Setting reliable resolvers fixes it permanently.
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');

mongoose.connection.on('connected', () => {
  logger.info('[db] MongoDB connected', { uri: sanitizeUri(env.MONGODB_URI) });
});

mongoose.connection.on('disconnected', () => {
  logger.warn('[db] MongoDB disconnected');
});

mongoose.connection.on('error', (err: Error) => {
  logger.error('[db] MongoDB error', { message: err.message });
});

function sanitizeUri(uri: string): string {
  // strip credentials from log output: mongodb+srv://user:pass@host → mongodb+srv://*@host
  return uri.replace(/:\/\/[^@]+@/, '://*@');
}

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  } catch (err) {
    logger.error('[db] Initial connection failed, retrying...', {
      message: (err as Error).message,
    });
    await new Promise((resolve) => setTimeout(resolve, RECONNECT_INTERVAL_MS));
    await connectDatabase();
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.connection.close();
  logger.info('[db] MongoDB connection closed');
}

import { randomInt } from 'crypto';
import { env } from '@/config/env';
import { AppError } from '@/utils/AppError';
import { logger } from '@/config/logger';

const ZOOM_API = 'https://api.zoom.us/v2';
const ZOOM_TOKEN_URL = 'https://zoom.us/oauth/token';

function hasZoomCredentials(): boolean {
  return Boolean(env.ZOOM_ACCOUNT_ID && env.ZOOM_CLIENT_ID && env.ZOOM_CLIENT_SECRET);
}

// ── OAuth token (Server-to-Server) ───────────────────────

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 30_000) {
    return cachedToken.value;
  }

  const { ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET } = env;
  if (!ZOOM_ACCOUNT_ID || !ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET) {
    throw AppError.zoomError('Zoom credentials belum dikonfigurasi');
  }

  const creds = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64');
  const res = await fetch(
    `${ZOOM_TOKEN_URL}?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${creds}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw AppError.zoomError(`Zoom OAuth gagal: ${res.status} ${body}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return cachedToken.value;
}

// ── Zoom API call helper ──────────────────────────────────

async function zoomFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${ZOOM_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw AppError.zoomError(`Zoom API error ${res.status}: ${body}`);
  }

  // 204 No Content — no body
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Public API ────────────────────────────────────────────

export interface ZoomMeeting {
  id: string; // Zoom meeting ID (number as string)
  join_url: string;
  start_url: string;
  password: string;
}

function mockZoomMeeting(topic: string): ZoomMeeting {
  const id = String(randomInt(10_000_000_000, 99_999_999_999));
  logger.warn('[zoom] Credentials belum dikonfigurasi — pakai mock meeting (bukan Zoom asli)', {
    topic,
    meetingId: id,
  });
  return {
    id,
    join_url: `https://zoom.us/j/${id}?pwd=mock`,
    start_url: `https://zoom.us/s/${id}?zak=mock`,
    password: 'mock123',
  };
}

export async function createZoomMeeting(params: {
  topic: string;
  startTime: string; // ISO 8601
  duration: number; // menit
}): Promise<ZoomMeeting> {
  if (!hasZoomCredentials()) {
    return mockZoomMeeting(params.topic);
  }

  return zoomFetch<ZoomMeeting>('/users/me/meetings', {
    method: 'POST',
    body: JSON.stringify({
      topic: params.topic,
      type: 2, // scheduled
      start_time: params.startTime,
      duration: params.duration,
      timezone: 'Asia/Jakarta',
      settings: {
        join_before_host: false,
        waiting_room: true,
        mute_upon_entry: true,
      },
    }),
  });
}

export async function deleteZoomMeeting(meetingId: string): Promise<void> {
  if (!hasZoomCredentials()) {
    logger.warn('[zoom] Credentials belum dikonfigurasi — skip delete mock meeting', {
      meetingId,
    });
    return;
  }

  await zoomFetch<undefined>(`/meetings/${meetingId}`, { method: 'DELETE' });
}

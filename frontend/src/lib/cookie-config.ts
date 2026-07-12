/**
 * `secure` sengaja tidak diikat ke NODE_ENV — NODE_ENV=production dipaksa oleh
 * `npm start` (lihat package.json) terlepas dari apakah deployment sudah pakai
 * TLS. Kalau Secure di-set true padahal diakses lewat http://, browser akan
 * diam-diam menolak menyimpan cookie sehingga session hilang setiap request.
 * Set COOKIE_SECURE=false secara eksplisit di env kalau deployment belum HTTPS.
 */
export const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE !== "false",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
};

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:8000/api";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (token) {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // best-effort
    }
  }

  const baseUrl = new URL(req.url).origin;
  const res = NextResponse.redirect(`${baseUrl}/login`);
  res.cookies.set("token", "", { path: "/", maxAge: 0 });
  res.cookies.set("session", "", { path: "/", maxAge: 0 });
  return res;
}

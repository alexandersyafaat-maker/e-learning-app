import { NextRequest, NextResponse } from "next/server";
import type { Session } from "@/features/auth/types/auth.types";

const PUBLIC_PATHS = ["/login"];

const ROLE_HOME: Record<string, string> = {
  ADMIN: "/admin/akun",
  GURU: "/guru/materi",
  SISWA: "/siswa/materi",
};

const ROLE_PREFIXES = ["/admin", "/guru", "/siswa"];

function parseSession(raw: string | undefined): Session | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const session = parseSession(request.cookies.get("session")?.value);

  // No session → force login
  if (!session && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Has session → skip login page, redirect to role home
  if (session && isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = ROLE_HOME[session.role] ?? "/login";
    return NextResponse.redirect(url);
  }

  // Has session → block access to wrong role prefix
  if (session) {
    const isRolePath = ROLE_PREFIXES.some((p) => pathname.startsWith(p));
    const allowedHome = ROLE_HOME[session.role];
    const allowedPrefix = allowedHome
      ? "/" + allowedHome.split("/")[1]
      : null;

    if (isRolePath && allowedPrefix && !pathname.startsWith(allowedPrefix)) {
      const url = request.nextUrl.clone();
      url.pathname = allowedHome;
      return NextResponse.redirect(url);
    }
  }

  // Redirect root to login or role home
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = session ? (ROLE_HOME[session.role] ?? "/login") : "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

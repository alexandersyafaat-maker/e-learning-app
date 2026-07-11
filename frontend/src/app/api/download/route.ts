import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE = (process.env.API_URL ?? "http://localhost:8000/api").replace(/\/api$/, "");

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  const nama = request.nextUrl.searchParams.get("nama") ?? "download";

  if (!url) return new NextResponse("Missing url", { status: 400 });

  if (!url.startsWith(`${BACKEND_BASE}/uploads/`)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    return new NextResponse("Failed to fetch file", { status: 502 });
  }

  if (!response.ok) {
    return new NextResponse("File not found", { status: 404 });
  }

  const headers = new Headers();
  headers.set(
    "Content-Disposition",
    `attachment; filename*=UTF-8''${encodeURIComponent(nama)}`
  );
  headers.set(
    "Content-Type",
    response.headers.get("Content-Type") ?? "application/octet-stream"
  );
  const contentLength = response.headers.get("Content-Length");
  if (contentLength) headers.set("Content-Length", contentLength);
  headers.set("Cache-Control", "private, max-age=3600");

  return new NextResponse(response.body, { status: 200, headers });
}

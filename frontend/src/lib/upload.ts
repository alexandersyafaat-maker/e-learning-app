import { cookies } from "next/headers";
import type { Lampiran } from "@/lib/types";
import type { Session } from "@/features/auth/types/auth.types";

const API_URL = process.env.API_URL ?? "http://localhost:8000/api";

interface BackendResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export async function uploadLampiranFiles(
  files: File[],
  uploadEndpoint: string
): Promise<Lampiran[]> {
  const validFiles = files.filter((f) => f instanceof File && f.size > 0);
  if (validFiles.length === 0) return [];

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const results = await Promise.all(
    validFiles.map(async (file) => {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API_URL}${uploadEndpoint}`, {
        method: "POST",
        headers: authHeader,
        body: fd,
      });
      if (!res.ok) {
        throw new Error(`Gagal mengupload file: ${file.name}`);
      }
      const json: BackendResponse<Lampiran> = await res.json();
      if (!json.success) {
        throw new Error(json.error ?? `Upload gagal: ${file.name}`);
      }
      return json.data;
    })
  );

  return results;
}

export async function uploadAvatarFile(file: File): Promise<Session> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const fd = new FormData();
  fd.append("foto", file);

  const res = await fetch(`${API_URL}/auth/me/avatar`, {
    method: "POST",
    headers: authHeader,
    body: fd,
  });

  const json: BackendResponse<Session> = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.error ?? "Gagal mengupload foto profil");
  }

  return json.data;
}

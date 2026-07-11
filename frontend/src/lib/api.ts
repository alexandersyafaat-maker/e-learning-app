import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.API_URL ?? "http://localhost:8000/api";

interface BackendResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  code?: string;
}

async function getAuthHeader(): Promise<Record<string, string>> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const authHeader = await getAuthHeader();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
      ...(options.headers as Record<string, string>),
    },
    cache: options.cache ?? "no-store",
  });

  if (res.status === 204) return undefined as T;

  if (res.status === 401) {
    // Token missing or expired — force re-login.
    // redirect() throws NEXT_REDIRECT which Next.js handles in both
    // Server Components and Server Actions.
    redirect("/api/logout");
  }

  const json: BackendResponse<T> = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.error ?? `API error ${res.status}`);
  }

  return json.data;
}

export async function apiDelete(path: string): Promise<boolean> {
  const authHeader = await getAuthHeader();
  const res = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...authHeader },
    cache: "no-store",
  });
  return res.ok;
}

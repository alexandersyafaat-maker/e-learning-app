import type { User } from "../types/auth.types";
import { apiFetch } from "@/lib/api";

export async function fetchCurrentUser(): Promise<User | null> {
  try {
    return await apiFetch<User>("/auth/me");
  } catch {
    return null;
  }
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Re-throws Next.js navigation errors (redirect/notFound), falls back to [] for real errors. */
export function fallbackArray<T>(promise: Promise<T[]>): Promise<T[]> {
  return promise.catch((e) => {
    if (e && typeof e === 'object' && 'digest' in e) throw e;
    return [] as T[];
  });
}

"use server";

import type { ActionResponse } from "@/lib/types";
import type { GrammarCheckResult } from "../types/grammar.types";

// Public LanguageTool API — free tier: 20 req/min, 75k chars/day.
// For production: self-host via Docker (languagetool-org/languagetool).
const LT_API = "https://api.languagetool.org/v2/check";

export async function checkGrammarAction(
  text: string
): Promise<ActionResponse<GrammarCheckResult>> {
  const trimmed = text?.trim();
  if (!trimmed) return { success: false, error: "Teks kosong." };
  if (trimmed.length > 5000) return { success: false, error: "Teks terlalu panjang (maks 5000 karakter)." };

  try {
    const body = new URLSearchParams({
      text: trimmed,
      language: "en-US",
      enabledOnly: "false",
    });

    const res = await fetch(LT_API, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      if (res.status === 429) return { success: false, error: "Terlalu banyak permintaan. Coba lagi sebentar." };
      return { success: false, error: "Gagal menghubungi layanan grammar check." };
    }

    const data = await res.json();
    return { success: true, data: { matches: data.matches ?? [] } };
  } catch {
    return { success: false, error: "Koneksi ke layanan grammar check gagal." };
  }
}

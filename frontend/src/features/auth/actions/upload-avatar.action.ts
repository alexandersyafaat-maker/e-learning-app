"use server";

import { cookies } from "next/headers";
import type { ActionResponse } from "@/lib/types";
import type { Session } from "../types/auth.types";
import { uploadAvatarFile } from "@/lib/upload";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
};

export async function uploadAvatarAction(
  _prevState: ActionResponse<Session> | null,
  formData: FormData
): Promise<ActionResponse<Session>> {
  const file = formData.get("foto");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Pilih file foto terlebih dahulu." };
  }

  try {
    const session = await uploadAvatarFile(file);
    const cookieStore = await cookies();
    cookieStore.set("session", JSON.stringify(session), COOKIE_OPTS);
    return { success: true, data: session };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Gagal mengupload foto profil.";
    return { success: false, error: message };
  }
}

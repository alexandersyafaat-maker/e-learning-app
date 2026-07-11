"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import type { ActionResponse } from "@/lib/types";

/**
 * Handles the success/error feedback pattern for useActionState forms.
 * - Fires toast.success + calls onSuccess when action succeeds
 * - Returns error string for inline display when action fails
 */
export function useActionFeedback<T>(
  state: ActionResponse<T> | null,
  successMsg: string,
  onSuccess?: (data: T) => void
): string | undefined {
  useEffect(() => {
    if (!state?.success) return;
    toast.success(successMsg);
    onSuccess?.(state.data);
  }, [state, successMsg, onSuccess]);

  return state?.success === false ? state.error : undefined;
}

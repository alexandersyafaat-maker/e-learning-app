import { toast } from "sonner";
import type { ActionResponse } from "@/lib/types";

/**
 * Handles direct action calls (useTransition pattern).
 * Shows toast.success on success, toast.error on failure.
 * Returns true if action succeeded.
 */
export async function handleAction<T>(
  result: ActionResponse<T>,
  opts: {
    successMsg: string;
    onSuccess?: (data: T) => void;
  }
): Promise<boolean> {
  if (result.success) {
    toast.success(opts.successMsg);
    opts.onSuccess?.(result.data);
    return true;
  }
  toast.error(result.error);
  return false;
}

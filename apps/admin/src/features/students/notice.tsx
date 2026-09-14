"use client";

import { useState } from "react";
import { cn } from "@tau/ui/lib/utils";

type Notice = { ok: boolean; text: string };

/** Shows the outcome of the last mutation, including the policy's refusal reasons. */
export function useNotice() {
  const [notice, setNotice] = useState<Notice>();
  return {
    notice,
    announce(result: { ok: boolean; error?: string }, success: string) {
      setNotice(result.ok ? { ok: true, text: success } : { ok: false, text: result.error ?? "The change was refused." });
      return result.ok;
    },
  };
}

export function NoticeBanner({ notice }: { notice?: Notice }) {
  if (!notice) return null;
  return (
    <div
      role={notice.ok ? "status" : "alert"}
      className={cn(
        "rounded-lg border px-4 py-3 text-sm font-medium",
        notice.ok ? "border-success/30 bg-success/5 text-success" : "border-destructive/30 bg-destructive/5 text-destructive",
      )}
    >
      {notice.text}
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/providers/session-provider";
import { AppShell } from "@/components/console/app-shell";

/**
 * The console guard.
 *
 * This keeps unauthenticated people off the screens, but it is not what protects
 * the data — a layout does not re-run on every client navigation, and in this
 * build the guard runs in the browser anyway. Authority is decided in the policy
 * engine next to the data, which is why every mutation re-checks rather than
 * trusting that the caller got past this component.
 */
export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const { session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) router.replace("/sign-in");
  }, [session, router]);

  if (!session) {
    return (
      <div className="grid min-h-dvh place-items-center px-4">
        <p className="text-muted-foreground text-sm">Taking you to sign in…</p>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}

"use client";

import { useCallback, useSyncExternalStore } from "react";
import { identityAuth } from "@tau/identity";
import {
  clearSession,
  getServerSnapshot,
  getSnapshot,
  subscribe,
  writeSession,
} from "@/lib/session-store";
import type { ConsoleSession } from "@/lib/session-store";

export type { ConsoleSession };

export function useSession() {
  const session = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const signOut = useCallback(async () => {
    if (session) {
      await identityAuth.signOut({ sessionId: session.sessionId, personId: session.personId });
    }
    clearSession();
  }, [session]);

  return { session, setSession: writeSession, signOut };
}

/**
 * The acting person for mutations. Every write records who did it, so a screen
 * that cannot name an actor must not be able to write.
 */
export function useActor(): ConsoleSession {
  const { session } = useSession();
  if (!session) {
    throw new Error("No signed-in session: this screen must be behind the console guard");
  }
  return session;
}

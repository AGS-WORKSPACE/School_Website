"use client";

import { useCallback, useSyncExternalStore } from "react";
import { identityAuth } from "@tau/identity";
import type { StudentSession } from "@tau/student-dashboard";
import { clearSession, getServerSnapshot, getSnapshot, subscribe, writeSession } from "@/lib/student-session";

export function useStudentSession() {
  const session = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const signOut = useCallback(async () => {
    if (session) await identityAuth.signOut({ sessionId: session.sessionId, personId: session.personId });
    clearSession();
  }, [session]);

  return { session: session ?? undefined, setSession: writeSession, signOut };
}

export type { StudentSession };

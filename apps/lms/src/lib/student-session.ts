/**
 * The signed-in student's session, held outside React.
 *
 * sessionStorage, not localStorage: closing the tab ends the session, and the
 * next person on a shared machine starts signed out (SD-AUTH-04). Identity
 * (EP-01) remains the authority — this only remembers which session is open.
 */

import type { StudentSession } from "@tau/student-dashboard";

const storageKey = "tau.lms.student-session";
const listeners = new Set<() => void>();

/** Snapshots must be referentially stable or React re-renders forever. */
let cachedRaw: string | null = null;
let cachedSession: StudentSession | null = null;

function readRaw(): string | null {
  try {
    return window.sessionStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function getSnapshot(): StudentSession | null {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedSession = raw ? (JSON.parse(raw) as StudentSession) : null;
    } catch {
      cachedSession = null;
    }
  }
  return cachedSession;
}

/** There is no session on the server; the client corrects this during hydration. */
export function getServerSnapshot(): StudentSession | null {
  return null;
}

function emit(): void {
  for (const listener of listeners) listener();
}

export function writeSession(session: StudentSession): void {
  try {
    window.sessionStorage.setItem(storageKey, JSON.stringify(session));
  } catch {
    // Non-fatal: the session simply will not survive a refresh.
  }
  emit();
}

export function clearSession(): void {
  try {
    window.sessionStorage.removeItem(storageKey);
  } catch {
    // Ignore.
  }
  emit();
}

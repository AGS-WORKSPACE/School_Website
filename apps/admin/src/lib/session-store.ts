/**
 * The console session, held outside React.
 *
 * sessionStorage is an external store, so it is read through
 * `useSyncExternalStore` rather than copied into state inside an effect — that
 * keeps the server render and the hydrated render consistent without a
 * cascading re-render on every page load.
 *
 * This is client-side only because the whole identity store in this build is.
 * When the store moves behind a real API, this file becomes a thin reader over an
 * httpOnly cookie session and nothing that consumes it has to change.
 */

export interface ConsoleSession {
  personId: string;
  accountId: string;
  sessionId: string;
  displayName: string;
  mfaSatisfied: boolean;
  startedAt: string;
}

const storageKey = "tau.admin.session";
const listeners = new Set<() => void>();

/** Snapshots must be referentially stable or React will re-render forever. */
let cachedRaw: string | null = null;
let cachedSession: ConsoleSession | null = null;

function readRaw(): string | null {
  try {
    return window.sessionStorage.getItem(storageKey);
  } catch {
    // Private mode or blocked storage: treated as signed out.
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

export function getSnapshot(): ConsoleSession | null {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedSession = raw ? (JSON.parse(raw) as ConsoleSession) : null;
    } catch {
      cachedSession = null;
    }
  }
  return cachedSession;
}

/** There is no session on the server; the client corrects this during hydration. */
export function getServerSnapshot(): ConsoleSession | null {
  return null;
}

function emit(): void {
  for (const listener of listeners) listener();
}

export function writeSession(session: ConsoleSession): void {
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

"use client";

import { useSyncExternalStore } from "react";
import { UserCog } from "lucide-react";
import { NativeSelect } from "@tau/ui/native-select";

/**
 * Demonstration-only persona switching for module screens whose rules depend on
 * who is acting (maker-checker, unit ownership, role permissions). Each module
 * gets its own remembered choice.
 */
export function createPersonaSwitcher<P extends { personId: string; name: string }>(storageKey: string, personas: readonly P[], describe: (persona: P) => string) {
  const listeners = new Set<() => void>();
  let current: string | undefined;

  function read(): string {
    if (current) return current;
    try {
      current = localStorage.getItem(storageKey) ?? undefined;
    } catch {
      // Storage unavailable; fall back to the first persona.
    }
    return current ?? personas[0].personId;
  }

  function write(personId: string) {
    current = personId;
    try {
      localStorage.setItem(storageKey, personId);
    } catch {
      // Keep the in-memory choice.
    }
    listeners.forEach((listener) => listener());
  }

  function usePersona(): P {
    const personId = useSyncExternalStore(
      (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
      read,
      () => personas[0].personId,
    );
    return personas.find((persona) => persona.personId === personId) ?? personas[0];
  }

  function PersonaSwitcher() {
    const persona = usePersona();
    return (
      <label className="flex min-w-[16rem] flex-col gap-1 text-xs font-semibold text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <UserCog className="size-3.5" aria-hidden /> Acting as (demo)
        </span>
        <NativeSelect value={persona.personId} onChange={(event) => write(event.target.value)} aria-label="Acting as">
          {personas.map((item) => (
            <option key={item.personId} value={item.personId}>
              {item.name} — {describe(item)}
            </option>
          ))}
        </NativeSelect>
      </label>
    );
  }

  return { usePersona, PersonaSwitcher };
}

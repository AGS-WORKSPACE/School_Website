"use client";

import { useSyncExternalStore } from "react";
import { UserCog } from "lucide-react";
import { NativeSelect } from "@tau/ui/native-select";
import { studentsActors, type StudentsActor } from "@tau/students";

/**
 * Demonstration-only persona switcher. The student-record screens enforce
 * maker-checker and unit ownership, so reviewers need to act as different staff.
 */
const STORAGE_KEY = "tau_students_acting_as";
const listeners = new Set<() => void>();
let current: string | undefined;

function read(): string {
  if (current) return current;
  try {
    current = localStorage.getItem(STORAGE_KEY) ?? undefined;
  } catch {
    // Storage unavailable; fall back to the default persona.
  }
  return current ?? studentsActors[0].personId;
}

function write(personId: string) {
  current = personId;
  try {
    localStorage.setItem(STORAGE_KEY, personId);
  } catch {
    // Keep the in-memory choice.
  }
  listeners.forEach((listener) => listener());
}

export function useActingAs(): StudentsActor {
  const personId = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    read,
    () => studentsActors[0].personId,
  );
  return studentsActors.find((actor) => actor.personId === personId) ?? studentsActors[0];
}

export function ActingAsSwitcher() {
  const actor = useActingAs();
  return (
    <label className="flex min-w-[16rem] flex-col gap-1 text-xs font-semibold text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <UserCog className="size-3.5" aria-hidden /> Acting as (demo)
      </span>
      <NativeSelect value={actor.personId} onChange={(event) => write(event.target.value)} aria-label="Acting as">
        {studentsActors.map((item) => (
          <option key={item.personId} value={item.personId}>
            {item.name} — {item.role}
          </option>
        ))}
      </NativeSelect>
    </label>
  );
}

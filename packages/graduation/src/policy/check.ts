export interface PolicyCheck {
  allowed: boolean;
  errors: string[];
}

export function check(errors: string[]): PolicyCheck {
  return { allowed: errors.length === 0, errors };
}

/** Permissions come from identity roles; `unit` scopes clearance checkpoints. */
export interface GraduationActor {
  personId: string;
  name: string;
  title: string;
  unit: string;
  roleIds: string[];
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value as Record<string, unknown>).sort().map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function fnv1a32(text: string, seed: number): string {
  let hash = seed >>> 0;
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

/**
 * Deterministic 64-bit fingerprint (two seeded FNV-1a passes) of a value.
 * Detects any change to a frozen list or generated transcript in this
 * demonstration build; production would sign server-side (HMAC or Ed25519)
 * with a managed key.
 */
export function fingerprint(value: unknown): string {
  const text = stableStringify(value);
  return fnv1a32(text, 0x811c9dc5) + fnv1a32(text, 0x5bd1e995);
}

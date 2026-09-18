export function humanise(value: string): string {
  return value.replaceAll("_", " ");
}

/** StatusBadge keys are kebab-case; domain enums use Snake_Case. */
export function statusKey(value: string): string {
  return value.toLowerCase().replaceAll("_", "-");
}

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

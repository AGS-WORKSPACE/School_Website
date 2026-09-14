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

export function studentName(fields: { firstName: { value: string }; middleName: { value: string }; surname: { value: string } }): string {
  return [fields.firstName.value, fields.middleName.value, fields.surname.value].filter(Boolean).join(" ");
}

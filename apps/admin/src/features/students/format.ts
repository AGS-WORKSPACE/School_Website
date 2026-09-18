export function studentName(fields: { firstName: { value: string }; middleName: { value: string }; surname: { value: string } }): string {
  return [fields.firstName.value, fields.middleName.value, fields.surname.value].filter(Boolean).join(" ");
}

/**
 * Scope containment (IAM-02).
 *
 * The whole of scoped access reduces to one question: does the unit a grant was
 * made against sit at, or above, the unit being acted on? Everything else — list
 * filtering, export filtering, API filtering — calls the same function, so the
 * three cannot drift apart.
 */

import type { OrgUnit, Scope, ScopeDimension } from "../domain/org";

const dimensionOrder: Record<ScopeDimension, number> = {
  institution: 0,
  campus: 1,
  faculty: 2,
  department: 3,
  programme: 4,
  cohort: 5,
};

export function dimensionRank(dimension: ScopeDimension): number {
  return dimensionOrder[dimension];
}

export function indexUnits(units: OrgUnit[]): Map<string, OrgUnit> {
  return new Map(units.map((unit) => [unit.id, unit]));
}

/** The unit and every ancestor above it, root last. */
export function unitAncestry(units: Map<string, OrgUnit>, unitId: string): OrgUnit[] {
  const chain: OrgUnit[] = [];
  const seen = new Set<string>();
  let current = units.get(unitId);

  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    chain.push(current);
    current = current.parentId ? units.get(current.parentId) : undefined;
  }

  return chain;
}

/**
 * True when `outer` covers `inner` — the same unit, or an ancestor of it.
 *
 * Dimension alone is never enough: two faculties are the same dimension and
 * cover nothing of each other.
 */
export function scopeCovers(units: Map<string, OrgUnit>, outer: Scope, inner: Scope): boolean {
  if (outer.unitId === inner.unitId) return true;
  return unitAncestry(units, inner.unitId).some((unit) => unit.id === outer.unitId);
}

/** The narrower of two scopes when one covers the other, otherwise null. */
export function overlappingScope(
  units: Map<string, OrgUnit>,
  a: Scope,
  b: Scope,
): Scope | null {
  if (scopeCovers(units, a, b)) return b;
  if (scopeCovers(units, b, a)) return a;
  return null;
}

export function scopeLabel(units: Map<string, OrgUnit>, scope: Scope): string {
  return units.get(scope.unitId)?.name ?? scope.unitId;
}

export function scopePath(units: Map<string, OrgUnit>, scope: Scope): string {
  return unitAncestry(units, scope.unitId)
    .reverse()
    .map((unit) => unit.shortName)
    .join(" › ");
}

export function descendantUnitIds(units: OrgUnit[], unitId: string): string[] {
  const children = new Map<string, string[]>();
  for (const unit of units) {
    if (!unit.parentId) continue;
    children.set(unit.parentId, [...(children.get(unit.parentId) ?? []), unit.id]);
  }

  const collected: string[] = [];
  const queue = [unitId];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;
    collected.push(current);
    queue.push(...(children.get(current) ?? []));
  }
  return collected;
}

/**
 * Guards a grant against being made too broadly — a permission capped at faculty
 * level cannot be handed out institution-wide, however senior the grantee.
 */
export function isGrantDimensionAllowed(
  permissionMaxDimension: ScopeDimension,
  grantDimension: ScopeDimension,
): boolean {
  return dimensionRank(grantDimension) >= dimensionRank(permissionMaxDimension);
}

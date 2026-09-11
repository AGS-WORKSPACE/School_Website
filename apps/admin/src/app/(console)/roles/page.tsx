"use client";

/**
 * The permission matrix.
 *
 * Deliberately the whole catalogue on one page: the value of a matrix is seeing
 * that no single role spans both halves of a duties rule, and that is only
 * visible when you can read across.
 */

import { useMemo, useState } from "react";
import { Check, ShieldAlert } from "lucide-react";
import { usePermissionCatalogue, useRoles, useSodRules } from "@tau/identity/react";
import { Badge } from "@tau/ui/badge";
import { NativeSelect } from "@tau/ui/native-select";
import { Label } from "@tau/ui/label";
import { Skeleton } from "@tau/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tau/ui/table";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Section } from "@/components/console/section";

export default function RolesPage() {
  const { data: roles, isPending } = useRoles();
  const { data: permissions } = usePermissionCatalogue();
  const { data: rules } = useSodRules();
  const [module, setModule] = useState("all");

  const modules = useMemo(
    () => [...new Set((permissions ?? []).map((permission) => permission.module))].sort(),
    [permissions],
  );

  const visiblePermissions = useMemo(
    () =>
      (permissions ?? []).filter(
        (permission) => module === "all" || permission.module === module,
      ),
    [permissions, module],
  );

  /** Permissions that sit on opposite sides of a duties rule, for the matrix legend. */
  const dutiesPaired = useMemo(() => {
    const map = new Map<string, string>();
    for (const rule of rules ?? []) {
      map.set(rule.permissionA, rule.label);
      map.set(rule.permissionB, rule.label);
    }
    return map;
  }, [rules]);

  return (
    <>
      <PageHeader
        eyebrow="IAM-02"
        title="Roles and permissions"
        description="Roles are bundles of permissions belonging to one workspace. None of them carries a scope: that is decided when the role is assigned, which is how the same role stays separate between faculties."
      />

      {isPending || !roles ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : (
        <>
          <Section
            title={`${roles.length} roles`}
            description="There is no all-powerful administrator role. The widest one is emergency-only and cannot be assigned at all."
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {roles.map((role) => (
                <div key={role.id} className="border-border space-y-2 rounded-lg border p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold">{role.name}</h3>
                    {role.privileged ? <Badge variant="accent">Privileged</Badge> : null}
                    {role.breakGlassOnly ? (
                      <Badge variant="destructive">
                        <ShieldAlert className="size-3.5" aria-hidden />
                        Emergency only
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-muted-foreground text-xs capitalize">{role.workspace}</p>
                  <p className="text-muted-foreground text-sm">{role.description}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {role.assignableDimensions.map((dimension) => (
                      <Badge key={dimension} variant="muted" className="capitalize">
                        {dimension}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-muted-foreground/80 text-xs">
                    {role.permissionIds.length} permission
                    {role.permissionIds.length === 1 ? "" : "s"}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          <Section
            title="Permission matrix"
            description="Permissions marked with a scale are one half of a segregation-of-duties rule. No role should hold both halves."
            actions={
              <div className="w-full sm:w-56">
                <Label htmlFor="module-filter" className="sr-only">
                  Filter by module
                </Label>
                <NativeSelect
                  id="module-filter"
                  value={module}
                  onChange={(event) => setModule(event.target.value)}
                >
                  <option value="all">All modules</option>
                  {modules.map((name) => (
                    <option key={name} value={name} className="capitalize">
                      {name}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            }
            contentClassName="px-0 sm:px-6"
          >
            {visiblePermissions.length === 0 ? (
              <div className="px-6 sm:px-0">
                <EmptyState message="No permissions in that module." />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="min-w-[60rem]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 min-w-[18rem] bg-inherit">
                        Permission
                      </TableHead>
                      {roles
                        .filter((role) => !role.breakGlassOnly)
                        .map((role) => (
                          <TableHead key={role.id} className="text-center align-bottom">
                            <span className="block max-w-[6rem] text-xs leading-tight">
                              {role.name}
                            </span>
                          </TableHead>
                        ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visiblePermissions.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell className="sticky left-0 bg-inherit">
                          <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                            {permission.label}
                            <Badge
                              variant={
                                permission.risk === "high"
                                  ? "destructive"
                                  : permission.risk === "elevated"
                                    ? "warning"
                                    : "muted"
                              }
                            >
                              {permission.risk}
                            </Badge>
                            {permission.requiresMfa ? <Badge variant="outline">MFA</Badge> : null}
                          </span>
                          <span className="text-muted-foreground mt-1 block font-mono text-xs">
                            {permission.id}
                          </span>
                          {dutiesPaired.has(permission.id) ? (
                            <span className="text-muted-foreground/80 mt-1 block text-xs">
                              Duties rule: {dutiesPaired.get(permission.id)}
                            </span>
                          ) : null}
                          <span className="text-muted-foreground/80 mt-1 block text-xs">
                            Grantable no wider than {permission.maxGrantDimension}
                          </span>
                        </TableCell>
                        {roles
                          .filter((role) => !role.breakGlassOnly)
                          .map((role) => (
                            <TableCell key={role.id} className="text-center">
                              {role.permissionIds.includes(permission.id) ? (
                                <Check
                                  className="text-primary mx-auto size-4"
                                  aria-label={`${role.name} holds ${permission.label}`}
                                />
                              ) : (
                                <span className="text-muted-foreground/40" aria-hidden>
                                  ·
                                </span>
                              )}
                            </TableCell>
                          ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Section>
        </>
      )}
    </>
  );
}

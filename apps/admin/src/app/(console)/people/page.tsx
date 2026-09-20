"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ShieldCheck, ShieldX } from "lucide-react";
import { usePersons } from "@tau/identity/react";
import { Badge } from "@tau/ui/badge";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";
import { NativeSelect } from "@tau/ui/native-select";
import { Skeleton } from "@tau/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tau/ui/table";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Section } from "@/components/console/section";
import { StatusBadge } from "@/components/console/status-badge";

type Filter = "all" | "privileged" | "no-mfa" | "conflicts" | "inactive";

export default function PeoplePage() {
  const { data, isPending } = usePersons();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data ?? []).filter((row) => {
      if (term && !`${row.displayName} ${row.person.email} ${row.unitLabel}`.toLowerCase().includes(term)) {
        return false;
      }
      if (filter === "privileged") return row.privileged;
      if (filter === "no-mfa") return row.privileged && !row.mfaEnrolled;
      if (filter === "conflicts") return row.blockingConflicts > 0;
      if (filter === "inactive") return row.account?.status !== "active";
      return true;
    });
  }, [data, search, filter]);

  return (
    <>
      <PageHeader
        eyebrow="Directory"
        title="People and accounts"
        description="Manage people and their accounts."
      />

      <Section
        title={`${rows.length} ${rows.length === 1 ? "person" : "people"}`}
        description="Disabling an account is the single control that ends access everywhere: every live session is revoked in the same step."
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <div className="sm:w-64">
              <Label htmlFor="people-search" className="sr-only">
                Search people
              </Label>
              <Input
                id="people-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email or unit"
              />
            </div>
            <div className="sm:w-56">
              <Label htmlFor="people-filter" className="sr-only">
                Filter
              </Label>
              <NativeSelect
                id="people-filter"
                value={filter}
                onChange={(event) => setFilter(event.target.value as Filter)}
              >
                <option value="all">Everyone</option>
                <option value="privileged">Privileged roles</option>
                <option value="no-mfa">Privileged without MFA</option>
                <option value="conflicts">With blocking conflicts</option>
                <option value="inactive">Suspended or disabled</option>
              </NativeSelect>
            </div>
          </div>
        }
        contentClassName="px-0 sm:px-6"
      >
        {isPending ? (
          <div className="space-y-2 px-6 sm:px-0">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="px-6 sm:px-0">
            <EmptyState message="Nobody matches those filters." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Person</TableHead>
                  <TableHead>Relationships</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-center">MFA</TableHead>
                  <TableHead className="text-center">Roles</TableHead>
                  <TableHead className="text-center">Sessions</TableHead>
                  <TableHead className="text-center">Conflicts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.person.id}>
                    <TableCell>
                      <Link
                        href={`/people/${row.person.id}`}
                        className="hover:text-primary font-semibold"
                      >
                        {row.displayName}
                      </Link>
                      <p className="text-muted-foreground text-xs">{row.person.email}</p>
                      <p className="text-muted-foreground/80 text-xs">{row.unitLabel}</p>
                    </TableCell>
                    <TableCell>
                      <div
                        className="flex max-w-56 items-center gap-1"
                        role="group"
                        aria-label={`Relationships: ${row.person.affiliations.map((affiliation) => affiliation.type).join(", ")}`}
                        title={row.person.affiliations.map((affiliation) => affiliation.type).join(", ")}
                      >
                        {row.person.affiliations.slice(0, 2).map((affiliation) => (
                          <Badge
                            key={affiliation.id}
                            variant={affiliation.status === "active" ? "outline" : "muted"}
                            className="min-w-0 max-w-24 shrink truncate capitalize"
                            title={`${affiliation.reference} · ${affiliation.status}`}
                            aria-hidden="true"
                          >
                            {affiliation.type}
                          </Badge>
                        ))}
                        {row.person.affiliations.length > 2 ? (
                          <Badge variant="muted" className="shrink-0" aria-hidden="true">
                            +{row.person.affiliations.length - 2}
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={row.account?.status ?? "pending-activation"} />
                      {row.privileged ? (
                        <p className="text-muted-foreground mt-1 text-xs">Privileged</p>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.mfaEnrolled ? (
                        <ShieldCheck className="text-success mx-auto size-4" aria-label="Enrolled" />
                      ) : (
                        <ShieldX
                          className={row.privileged ? "text-destructive mx-auto size-4" : "text-muted-foreground mx-auto size-4"}
                          aria-label="Not enrolled"
                        />
                      )}
                    </TableCell>
                    <TableCell className="tabular text-center">{row.activeAssignments}</TableCell>
                    <TableCell className="tabular text-center">{row.liveSessions}</TableCell>
                    <TableCell className="text-center">
                      {row.blockingConflicts > 0 ? (
                        <Badge variant="destructive">{row.blockingConflicts}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Section>
    </>
  );
}

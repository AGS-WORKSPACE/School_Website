"use client";

/**
 * React Query bindings.
 *
 * Mutations invalidate broadly on purpose: changing one delegation can change
 * the dashboard counts, someone's duties conflicts and the audit trail at once,
 * and a stale access screen is worse than a re-fetch.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AuditChannel } from "../domain/audit";
import { identityApi } from "../mock";
import { identityAuth } from "../mock/auth";
import { identityKeys } from "./query-keys";

export function useAccessOverview() {
  return useQuery({ queryKey: identityKeys.overview, queryFn: identityApi.getOverview });
}

export function useOrgUnits() {
  return useQuery({ queryKey: identityKeys.units, queryFn: identityApi.getUnits });
}

export function usePersons() {
  return useQuery({ queryKey: identityKeys.persons, queryFn: identityApi.getPersons });
}

export function usePerson(personId: string) {
  return useQuery({
    queryKey: identityKeys.person(personId),
    queryFn: () => identityApi.getPerson(personId),
    enabled: Boolean(personId),
  });
}

export function useRoles() {
  return useQuery({ queryKey: identityKeys.roles, queryFn: identityApi.getRoles });
}

export function usePermissionCatalogue() {
  return useQuery({ queryKey: identityKeys.permissions, queryFn: identityApi.getPermissions });
}

export function useSodRules() {
  return useQuery({ queryKey: identityKeys.sodRules, queryFn: identityApi.getSodRules });
}

export function useAssignments() {
  return useQuery({ queryKey: identityKeys.assignments, queryFn: identityApi.getAssignments });
}

export function useDelegations() {
  return useQuery({ queryKey: identityKeys.delegations, queryFn: identityApi.getDelegations });
}

export function useConflicts() {
  return useQuery({ queryKey: identityKeys.conflicts, queryFn: identityApi.getConflicts });
}

export function useSodExceptions() {
  return useQuery({ queryKey: identityKeys.exceptions, queryFn: identityApi.getExceptions });
}

export function useBreakGlassGrants() {
  const query = useQuery({
    queryKey: identityKeys.breakGlass,
    queryFn: identityApi.getBreakGlassGrants,
    // A live grant has a clock on it, so the list must not go stale on screen.
    refetchInterval: 30_000,
  });
  return query;
}

export function useSessions() {
  return useQuery({ queryKey: identityKeys.sessions, queryFn: identityApi.getSessions });
}

export function useAuditEvents(filter: {
  search?: string;
  action?: string;
  channel?: AuditChannel | "all";
  actorPersonId?: string;
}) {
  return useQuery({
    queryKey: identityKeys.audit(filter),
    queryFn: () => identityApi.getAuditEvents(filter),
  });
}

export function useAuditVerification() {
  return useQuery({
    queryKey: identityKeys.auditVerification,
    queryFn: identityApi.verifyAudit,
  });
}

export function useDemoAccounts() {
  return useQuery({ queryKey: identityKeys.demoAccounts, queryFn: identityAuth.listDemoAccounts });
}

/** Anything that changes access changes several views at once. */
function useIdentityInvalidator() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: ["identity"] });
}

export function useSetAccountStatus() {
  const invalidate = useIdentityInvalidator();
  return useMutation({ mutationFn: identityApi.setAccountStatus, onSuccess: invalidate });
}

export function useRevokeSession() {
  const invalidate = useIdentityInvalidator();
  return useMutation({ mutationFn: identityApi.revokeSession, onSuccess: invalidate });
}

export function useEnrolMfa() {
  const invalidate = useIdentityInvalidator();
  return useMutation({ mutationFn: identityApi.enrolMfa, onSuccess: invalidate });
}

export function useRevokeMfa() {
  const invalidate = useIdentityInvalidator();
  return useMutation({ mutationFn: identityApi.revokeMfa, onSuccess: invalidate });
}

export function useIssueRecoveryCodes() {
  const invalidate = useIdentityInvalidator();
  return useMutation({ mutationFn: identityApi.issueRecoveryCodes, onSuccess: invalidate });
}

export function useCreateDelegation() {
  const invalidate = useIdentityInvalidator();
  return useMutation({ mutationFn: identityApi.createDelegation, onSuccess: invalidate });
}

export function useRevokeDelegation() {
  const invalidate = useIdentityInvalidator();
  return useMutation({ mutationFn: identityApi.revokeDelegation, onSuccess: invalidate });
}

export function useRequestSodException() {
  const invalidate = useIdentityInvalidator();
  return useMutation({ mutationFn: identityApi.requestSodException, onSuccess: invalidate });
}

export function useDecideSodException() {
  const invalidate = useIdentityInvalidator();
  return useMutation({ mutationFn: identityApi.decideSodException, onSuccess: invalidate });
}

export function useRevokeSodException() {
  const invalidate = useIdentityInvalidator();
  return useMutation({ mutationFn: identityApi.revokeSodException, onSuccess: invalidate });
}

export function useRequestBreakGlass() {
  const invalidate = useIdentityInvalidator();
  return useMutation({ mutationFn: identityApi.requestBreakGlass, onSuccess: invalidate });
}

export function useDecideBreakGlass() {
  const invalidate = useIdentityInvalidator();
  return useMutation({ mutationFn: identityApi.decideBreakGlass, onSuccess: invalidate });
}

export function useRevokeBreakGlass() {
  const invalidate = useIdentityInvalidator();
  return useMutation({ mutationFn: identityApi.revokeBreakGlass, onSuccess: invalidate });
}

export function useReviewBreakGlass() {
  const invalidate = useIdentityInvalidator();
  return useMutation({ mutationFn: identityApi.reviewBreakGlass, onSuccess: invalidate });
}

export function useReviewAssignment() {
  const invalidate = useIdentityInvalidator();
  return useMutation({ mutationFn: identityApi.reviewAssignment, onSuccess: invalidate });
}

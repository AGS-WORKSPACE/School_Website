import { identityReads } from "./api";
import { identityMutations } from "./mutations";

/** Single entry point for every screen: reads and mutations behind one object. */
export const identityApi = { ...identityReads, ...identityMutations };
export type IdentityApi = typeof identityApi;

export { identityAuth } from "./auth";
export type { SignInChallenge } from "./auth";
export { maxBreakGlassMinutes } from "./mutations";
export type { MutationResult } from "./mutations";
export { getStore, resetStore } from "./store";
export type { IdentityStoreData } from "./store";
export type {
  AccessOverview,
  AssignmentView,
  BreakGlassView,
  ConflictView,
  DelegationView,
  ExceptionView,
  PersonDetail,
  PersonSummary,
} from "./api";

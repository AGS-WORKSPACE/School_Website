/**
 * Reads the signed-in student's context from identity and the SIS, and the
 * view preferences the dashboard itself owns.
 */

import { identityApi } from "@tau/identity";
import { studentsStore } from "@tau/students/mock";
import type { ContextDenial, StudentContext, StudentLink, StudentSession } from "../domain/context";
import type { SourceModule } from "../domain/home";
import { resolveStudentContext } from "../policy/session-policy";
import type { SourceOverride } from "../policy/home-policy";
import { initialStudentLinks } from "./seed";
import { dashboardStore } from "./store";

export async function loadStudentContext(input: { session?: StudentSession; now: string; links?: StudentLink[] }): Promise<{ context?: StudentContext; denial?: ContextDenial }> {
  const links = input.links ?? initialStudentLinks;
  if (!input.session) return resolveStudentContext({ accounts: [], persons: [], links, students: [], lifecycleEvents: [], now: input.now });

  const detail = await identityApi.getPerson(input.session.personId);
  const students = studentsStore.getSnapshot();
  return resolveStudentContext({
    session: input.session,
    accounts: detail?.account ? [{ id: detail.account.id, personId: detail.account.personId, username: detail.account.username, status: detail.account.status }] : [],
    persons: detail ? [{ id: detail.person.id, title: detail.person.title, firstName: detail.person.firstName, lastName: detail.person.lastName, affiliations: detail.person.affiliations }] : [],
    links,
    students: students.students,
    lifecycleEvents: students.lifecycleEvents,
    now: input.now,
  });
}

export const dashboardMutations = {
  /** Hides an alert from this student's dashboard only. */
  dismissAlert(personId: string, alertId: string) {
    dashboardStore.setState((prev) => ({ ...prev, dismissedAlertIds: { ...prev.dismissedAlertIds, [personId]: [...new Set([...(prev.dismissedAlertIds[personId] ?? []), alertId])] } }));
  },

  restoreAlerts(personId: string) {
    dashboardStore.setState((prev) => ({ ...prev, dismissedAlertIds: { ...prev.dismissedAlertIds, [personId]: [] } }));
  },

  /** Demonstration only: show how the page behaves when a module is slow or unreachable. */
  setSourceOverride(source: SourceModule, override?: SourceOverride) {
    dashboardStore.setState((prev) => {
      const next = { ...prev.sourceOverrides };
      if (override) next[source] = override;
      else delete next[source];
      return { ...prev, sourceOverrides: next };
    });
  },

  reset() {
    dashboardStore.reset();
  },
};

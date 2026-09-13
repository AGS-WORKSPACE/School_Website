"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  initialAcademicSessions,
  initialActivities,
  initialFeatureFlags,
  initialOrganisationUnits,
  initialPolicyRules,
  initialReferenceCategories,
} from "./mock-data";
import type {
  AcademicMilestone,
  AcademicSession,
  ConfigurationActivity,
  ConfigurationStatus,
  EnvironmentName,
  FeatureFlag,
  ImpactSimulation,
  OrganisationUnit,
  PolicyRule,
  ReferenceCategory,
  ReferenceValue,
} from "./types";

interface ConfigurationState {
  units: OrganisationUnit[];
  sessions: AcademicSession[];
  referenceCategories: ReferenceCategory[];
  rules: PolicyRule[];
  flags: FeatureFlag[];
  activities: ConfigurationActivity[];
}

interface ConfigurationContextValue extends ConfigurationState {
  saveUnit: (unit: OrganisationUnit, previousId?: string) => void;
  createSession: (session: AcademicSession) => void;
  duplicateSession: (sessionId: string) => string | null;
  addMilestone: (sessionId: string, milestone: AcademicMilestone) => void;
  setSessionStatus: (sessionId: string, status: ConfigurationStatus) => void;
  addReferenceValue: (categoryId: string, value: ReferenceValue) => { ok: boolean; message: string };
  scheduleReferenceValue: (categoryId: string, valueId: string) => void;
  createRuleVersion: (ruleId: string) => void;
  advanceRule: (ruleId: string) => ConfigurationStatus | null;
  simulateRule: (ruleId: string) => ImpactSimulation;
  toggleFlag: (flagId: string, environment: Exclude<EnvironmentName, "Production">) => void;
  promoteFlag: (flagId: string, target: Exclude<EnvironmentName, "Development">, reason: string, reviewer: string) => void;
  rollbackFlag: (flagId: string, environment: Exclude<EnvironmentName, "Development">, reason: string) => void;
  resetDemo: () => void;
}

function initialState(): ConfigurationState {
  return {
    units: structuredClone(initialOrganisationUnits),
    sessions: structuredClone(initialAcademicSessions),
    referenceCategories: structuredClone(initialReferenceCategories),
    rules: structuredClone(initialPolicyRules),
    flags: structuredClone(initialFeatureFlags),
    activities: structuredClone(initialActivities),
  };
}

const ConfigurationContext = createContext<ConfigurationContextValue | null>(null);

export function ConfigurationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfigurationState>(initialState);

  const addActivity = useCallback(
    (draft: Omit<ConfigurationActivity, "id" | "date" | "actor" | "status"> & { status?: string }) => {
      const activity: ConfigurationActivity = {
        id: `activity-${Date.now()}`,
        date: new Date().toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }),
        actor: "Chinedu Okafor",
        status: draft.status ?? "Success",
        ...draft,
      };
      return activity;
    },
    [],
  );

  const saveUnit = useCallback(
    (unit: OrganisationUnit, previousId?: string) => {
      setState((current) => {
        const exists = Boolean(previousId && current.units.some((item) => item.id === previousId));
        const nextUnit = {
          ...unit,
          history: exists
            ? [
                {
                  version: `v${unit.history.length + 1}.0`,
                  status: unit.status,
                  effectiveFrom: unit.effectiveFrom,
                  effectiveTo: unit.effectiveTo,
                  changedAt: new Date().toLocaleString("en-NG"),
                  changedBy: "Chinedu Okafor",
                  reason: unit.reason,
                },
                ...unit.history,
              ]
            : unit.history,
        };
        return {
          ...current,
          units: exists
            ? current.units.map((item) => (item.id === previousId ? nextUnit : item))
            : [...current.units, nextUnit],
          activities: [
            addActivity({
              module: "Organisation",
              action: exists ? "Unit updated" : "Unit created",
              record: unit.name,
              previous: exists ? "Previous draft retained in history" : "No record",
              next: `${unit.status} unit ${unit.id}`,
              reason: unit.reason,
              environment: "Production",
            }),
            ...current.activities,
          ],
        };
      });
    },
    [addActivity],
  );

  const duplicateSession = useCallback(
    (sessionId: string) => {
      let result: string | null = null;
      setState((current) => {
        const source = current.sessions.find((session) => session.id === sessionId);
        if (!source) return current;
        const startYear = Number(source.name.slice(0, 4)) + 1;
        const id = `${startYear}-${startYear + 1}-copy`;
        result = id;
        const copy: AcademicSession = {
          ...structuredClone(source),
          id,
          name: `${startYear}/${startYear + 1}`,
          status: "Draft",
          version: "v0.1",
          lastModified: "Just now",
          milestones: source.milestones.map((milestone) => ({ ...milestone, id: `${milestone.id}-copy`, status: "Draft" })),
        };
        return {
          ...current,
          sessions: [...current.sessions, copy],
          activities: [addActivity({ module: "Academic Calendar", action: "Session duplicated", record: copy.name, previous: source.name, next: `${copy.name} v0.1`, reason: "Created from previous session", environment: "Production" }), ...current.activities],
        };
      });
      return result;
    },
    [addActivity],
  );

  const createSession = useCallback((session: AcademicSession) => {
    setState((current) => ({
      ...current,
      sessions: [...current.sessions, session],
      activities: [addActivity({ module: "Academic Calendar", action: "Session created", record: session.name, previous: "No session", next: `${session.version} · Draft`, reason: "New academic cycle", environment: "Production" }), ...current.activities],
    }));
  }, [addActivity]);

  const addMilestone = useCallback(
    (sessionId: string, milestone: AcademicMilestone) => {
      setState((current) => ({
        ...current,
        sessions: current.sessions.map((session) =>
          session.id === sessionId
            ? { ...session, milestones: [...session.milestones, milestone], lastModified: "Just now" }
            : session,
        ),
        activities: [addActivity({ module: "Academic Calendar", action: "Deadline added", record: milestone.name, previous: "No milestone", next: milestone.start, reason: "Calendar planning", environment: "Production" }), ...current.activities],
      }));
    },
    [addActivity],
  );

  const setSessionStatus = useCallback(
    (sessionId: string, status: ConfigurationStatus) => {
      setState((current) => ({
        ...current,
        sessions: current.sessions.map((session) =>
          session.id === sessionId ? { ...session, status, lastModified: "Just now" } : session,
        ),
        activities: [addActivity({ module: "Academic Calendar", action: `Session ${status.toLowerCase()}`, record: current.sessions.find((item) => item.id === sessionId)?.name ?? sessionId, previous: "Draft", next: status, reason: "Configuration lifecycle action", environment: "Production" }), ...current.activities],
      }));
    },
    [addActivity],
  );

  const addReferenceValue = useCallback(
    (categoryId: string, value: ReferenceValue) => {
      const category = state.referenceCategories.find((item) => item.id === categoryId);
      if (!category) return { ok: false, message: "Reference category not found." };
      if (category.values.some((item) => item.code.toLowerCase() === value.code.toLowerCase())) {
        return { ok: false, message: "That code already exists in this category." };
      }
      setState((current) => ({
        ...current,
        referenceCategories: current.referenceCategories.map((item) =>
          item.id === categoryId
            ? { ...item, values: [...item.values, value], lastUpdate: "Just now", version: `${item.version}-draft` }
            : item,
        ),
        activities: [addActivity({ module: "Reference Data", action: "Value added", record: `${category.name}: ${value.name}`, previous: "No value", next: `${value.code} · Draft`, reason: "Reference catalogue update", environment: "Production" }), ...current.activities],
      }));
      return { ok: true, message: "Reference value added to the draft version." };
    },
    [addActivity, state.referenceCategories],
  );

  const scheduleReferenceValue = useCallback(
    (categoryId: string, valueId: string) => {
      setState((current) => ({
        ...current,
        referenceCategories: current.referenceCategories.map((category) =>
          category.id === categoryId
            ? { ...category, values: category.values.map((value) => value.id === valueId ? { ...value, status: "Scheduled", effectiveTo: "2026-12-31" } : value) }
            : category,
        ),
      }));
    },
    [],
  );

  const createRuleVersion = useCallback(
    (ruleId: string) => {
      setState((current) => ({
        ...current,
        rules: current.rules.map((rule) => {
          if (rule.id !== ruleId) return rule;
          const major = Number(rule.version.replace(/\D/g, "")) || 1;
          const version = `v${major + 1}.0`;
          return { ...rule, version, status: "Draft", lastModified: "Just now", versions: [{ version, status: "Draft", effectiveFrom: "2026-09-21", changedAt: "Just now", changedBy: "Chinedu Okafor", reason: "New effective-dated version" }, ...rule.versions] };
        }),
        activities: [addActivity({ module: "Academic Rules", action: "Rule version created", record: current.rules.find((rule) => rule.id === ruleId)?.name ?? ruleId, previous: "Published version locked", next: "New draft version", reason: "Policy revision", environment: "Production" }), ...current.activities],
      }));
    },
    [addActivity],
  );

  const advanceRule = useCallback(
    (ruleId: string) => {
      let result: ConfigurationStatus | null = null;
      setState((current) => ({
        ...current,
        rules: current.rules.map((rule) => {
          if (rule.id !== ruleId || ["Published", "Superseded"].includes(rule.status)) return rule;
          const next: Partial<Record<ConfigurationStatus, ConfigurationStatus>> = { Draft: "In Review", "In Review": "Approved", Approved: "Published" };
          result = next[rule.status] ?? null;
          return result ? { ...rule, status: result, lastModified: "Just now", versions: rule.versions.map((version, index) => index === 0 ? { ...version, status: result! } : version) } : rule;
        }),
        activities: result ? [addActivity({ module: "Academic Rules", action: result === "Published" ? "Rule published" : "Rule lifecycle advanced", record: current.rules.find((rule) => rule.id === ruleId)?.name ?? ruleId, previous: "Previous lifecycle state", next: result, reason: "Review workflow completed", environment: "Production" }), ...current.activities] : current.activities,
      }));
      return result;
    },
    [addActivity],
  );

  const simulateRule = useCallback((ruleId: string): ImpactSimulation => ({
    affectedStudents: ruleId === "academic-standing" ? 4286 : 3172,
    changedStanding: 184,
    probation: 63,
    eligibleToProgress: 121,
    cohorts: ["2023 entry", "2024 entry", "2025 entry"],
    programmes: ["MBBS", "BSc Nursing", "BPharm", "BSc Public Health"],
    conflicts: ["One faculty override still references the superseded threshold"],
    missingConfiguration: [],
  }), []);

  const toggleFlag = useCallback((flagId: string, environment: Exclude<EnvironmentName, "Production">) => {
    const field = environment.toLowerCase() as "development" | "staging";
    setState((current) => ({ ...current, flags: current.flags.map((flag) => flag.id === flagId ? { ...flag, [field]: !flag[field], lastChanged: "Just now" } : flag) }));
  }, []);

  const promoteFlag = useCallback(
    (flagId: string, target: Exclude<EnvironmentName, "Development">, reason: string, reviewer: string) => {
      const field = target.toLowerCase() as "staging" | "production";
      setState((current) => ({
        ...current,
        flags: current.flags.map((flag) => flag.id === flagId ? { ...flag, [field]: true, lastChanged: "Just now", history: [{ version: `promotion-${Date.now()}`, status: "Published", effectiveFrom: new Date().toISOString().slice(0, 10), changedAt: "Just now", changedBy: reviewer, reason }, ...flag.history] } : flag),
        activities: [addActivity({ module: "Feature Flags", action: "Feature promoted", record: current.flags.find((flag) => flag.id === flagId)?.name ?? flagId, previous: `${target} disabled`, next: `${target} enabled`, reason, environment: target }), ...current.activities],
      }));
    },
    [addActivity],
  );

  const rollbackFlag = useCallback(
    (flagId: string, environment: Exclude<EnvironmentName, "Development">, reason: string) => {
      const field = environment.toLowerCase() as "staging" | "production";
      setState((current) => ({
        ...current,
        flags: current.flags.map((flag) => flag.id === flagId ? { ...flag, [field]: false, lastChanged: "Just now" } : flag),
        activities: [addActivity({ module: "Feature Flags", action: "Configuration rolled back", record: current.flags.find((flag) => flag.id === flagId)?.name ?? flagId, previous: `${environment} enabled`, next: `${environment} disabled`, reason, environment, status: "Warning" }), ...current.activities],
      }));
    },
    [addActivity],
  );

  const resetDemo = useCallback(() => {
    setState(initialState());
  }, []);

  const value = useMemo<ConfigurationContextValue>(() => ({ ...state, saveUnit, createSession, duplicateSession, addMilestone, setSessionStatus, addReferenceValue, scheduleReferenceValue, createRuleVersion, advanceRule, simulateRule, toggleFlag, promoteFlag, rollbackFlag, resetDemo }), [state, saveUnit, createSession, duplicateSession, addMilestone, setSessionStatus, addReferenceValue, scheduleReferenceValue, createRuleVersion, advanceRule, simulateRule, toggleFlag, promoteFlag, rollbackFlag, resetDemo]);

  return <ConfigurationContext.Provider value={value}>{children}</ConfigurationContext.Provider>;
}

export function useConfiguration() {
  const value = useContext(ConfigurationContext);
  if (!value) throw new Error("useConfiguration must be used inside ConfigurationProvider");
  return value;
}

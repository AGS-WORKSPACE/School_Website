"use client";
import { useSyncExternalStore } from "react";
import { calculateWorkloads, detectScheduleConflicts, roomUtilisation } from "../policy/scheduling-policy";
import { schedulingMutations } from "../mock/mutations";
import { schedulingStore } from "../mock/store";

export function useScheduling() {
  const state = useSyncExternalStore(schedulingStore.subscribe, schedulingStore.getSnapshot, schedulingStore.getSnapshot);
  return { ...state, conflicts: detectScheduleConflicts(state.activities, state.rooms, state.maintenanceBlocks), workloads: calculateWorkloads(state.activities, state.supervisions, state.workloadRule), utilisation: state.rooms.map((room) => roomUtilisation(state.usageRecords, room.id)), mutations: schedulingMutations };
}

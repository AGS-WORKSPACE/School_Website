"use client";

import { useSyncExternalStore } from "react";
import { registrationStore } from "../mock/store";
import { registrationMutations } from "../mock/mutations";
import { demoStudents } from "../mock/seed";

export function useRegistration() {
  const state = useSyncExternalStore(registrationStore.subscribe, registrationStore.getSnapshot, registrationStore.getSnapshot);
  return { ...state, demoStudents, mutations: registrationMutations, resetRegistrationStore: registrationStore.reset };
}

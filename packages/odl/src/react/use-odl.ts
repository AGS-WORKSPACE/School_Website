"use client";

import { useSyncExternalStore } from "react";
import { odlStore } from "../mock/store";
import { odlMutations } from "../mock/mutations";

export function useOdl() {
  const state = useSyncExternalStore(odlStore.subscribe, odlStore.getSnapshot, odlStore.getSnapshot);
  return { ...state, mutations: odlMutations, resetOdlStore: odlStore.reset };
}

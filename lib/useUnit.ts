"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Unit } from "@/lib/format";

const UNIT_KEY = "unit";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

// Persisted °F/°C preference read as an external store: no setState-in-effect,
// useSyncExternalStore handles the SSR→client mismatch, and the preference is
// shared across pages (home + day views) via the same localStorage key.
export function useUnit(): [Unit, () => void] {
  const unit = useSyncExternalStore<Unit>(
    subscribe,
    () => (window.localStorage.getItem(UNIT_KEY) === "C" ? "C" : "F"),
    () => "F",
  );
  const toggle = useCallback(() => {
    const next: Unit = unit === "F" ? "C" : "F";
    window.localStorage.setItem(UNIT_KEY, next);
    window.dispatchEvent(new StorageEvent("storage", { key: UNIT_KEY }));
  }, [unit]);
  return [unit, toggle];
}

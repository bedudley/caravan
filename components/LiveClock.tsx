"use client";

import { useSyncExternalStore } from "react";
import { Clock } from "lucide-react";

// One shared 1s ticker behind useSyncExternalStore — no setState-in-effect, and
// SSR renders nothing (getServerSnapshot → 0) so there's no hydration mismatch.
let nowMs = Date.now();
const subs = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function subscribe(cb: () => void) {
  subs.add(cb);
  timer ??= setInterval(() => {
    nowMs = Date.now();
    subs.forEach((f) => f());
  }, 1000);
  return () => {
    subs.delete(cb);
    if (subs.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

function useNowMs(): number {
  return useSyncExternalStore(
    subscribe,
    () => nowMs,
    () => 0,
  );
}

function fmtTime(ms: number, tz?: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
  }).format(ms);
}

/**
 * Subtle "now" line. Shows the time where we are; appends the viewer's local
 * time ONLY when it differs (i.e. parents in another zone). For someone in the
 * destination's timezone it collapses to a single clock — no clutter.
 */
export default function LiveClock({
  tripCity,
  tripTz,
}: {
  tripCity: string;
  tripTz: string;
}) {
  const ms = useNowMs();
  if (!ms) return null; // SSR / pre-hydration

  // The displayed time is in `tripTz`. On travel days the city is a route
  // ("Denver → Paris") but tripTz is the *origin's* zone, so label with the
  // origin (the part before the arrow) — otherwise the time reads like the
  // destination's when it isn't.
  const tripLabel = tripCity.split("→")[0].trim();
  const there = fmtTime(ms, tripTz);
  const here = fmtTime(ms);
  const sameClock = there === here;

  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-faint">
      <Clock size={12} className="shrink-0" aria-hidden />
      <span>
        <span className="text-muted">{tripLabel}</span> {there}
        {!sameClock && (
          <>
            {"  ·  "}
            <span className="text-muted">Your time</span> {here}
          </>
        )}
      </span>
    </p>
  );
}

export type Unit = "F" | "C";

export function toUnit(celsius: number, unit: Unit): number {
  return unit === "F" ? celsius * (9 / 5) + 32 : celsius;
}

/** Rounded temperature with degree sign, e.g. "72°" */
export function formatTemp(celsius: number, unit: Unit): string {
  return `${Math.round(toUnit(celsius, unit))}°`;
}

/** "Tue, Jun 23" from an ISO yyyy-mm-dd (parsed at noon to dodge tz drift) */
export function formatDay(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** "Jun 23" — compact, for date ranges */
export function formatShortDay(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** "Jun 23 – 26" / "Jun 30 – Jul 2" / "Jun 27" from two ISO dates */
export function formatDateRange(start: string, end: string): string {
  if (start === end) return formatShortDay(start);
  const sameMonth = start.slice(0, 7) === end.slice(0, 7);
  const endLabel = sameMonth ? String(Number(end.slice(8, 10))) : formatShortDay(end);
  return `${formatShortDay(start)} – ${endLabel}`;
}

/** Hour label straight from the local ISO string, e.g. "2PM" (no tz math) */
export function formatHour(iso: string): string {
  const h = Number(iso.slice(11, 13));
  const period = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}${period}`;
}

/** "6:21 AM" from a local ISO string like "2026-06-23T06:21" */
export function formatClock(iso: string): string {
  const h = Number(iso.slice(11, 13));
  const m = iso.slice(14, 16);
  const period = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${period}`;
}

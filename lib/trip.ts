import {
  itinerary,
  countries,
  type Country,
  type Stop,
} from "@/data/itinerary";

const MS_PER_DAY = 86_400_000;

/** Current calendar date (yyyy-mm-dd) in a given IANA timezone. */
export function dateInTz(tz: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export type Status = "before" | "during" | "after";
export type TripStatus = {
  todayIndex: number; // -1 when not currently on the trip
  status: Status;
  featuredIndex: number;
  daysUntil: number; // days until the first stop (negative once underway/past)
};

/** Where are we in the trip right now (each stop judged in its own timezone)? */
export function getTripStatus(): TripStatus {
  const todayIndex = itinerary.findIndex(
    (s) => s.date === dateInTz(s.timezone),
  );

  const first = itinerary[0];
  const daysUntil = Math.round(
    (Date.parse(first.date) - Date.parse(dateInTz(first.timezone))) / MS_PER_DAY,
  );

  if (todayIndex >= 0) {
    return { todayIndex, status: "during", featuredIndex: todayIndex, daysUntil };
  }
  if (daysUntil > 0) {
    return { todayIndex: -1, status: "before", featuredIndex: 0, daysUntil };
  }
  return {
    todayIndex: -1,
    status: "after",
    featuredIndex: itinerary.length - 1,
    daysUntil,
  };
}

export function findStop(id: string): Stop | undefined {
  return itinerary.find((s) => s.id === id);
}

export function stopIndex(id: string): number {
  return itinerary.findIndex((s) => s.id === id);
}

/** Previous / next stop in itinerary order (for day-to-day nav). */
export function adjacentStops(id: string): { prev?: Stop; next?: Stop } {
  const i = stopIndex(id);
  if (i < 0) return {};
  return { prev: itinerary[i - 1], next: itinerary[i + 1] };
}

export function stopsByCountry(name: string): Stop[] {
  return itinerary.filter((s) => s.country === name);
}

const FALLBACK_ACCENT = "#c77d43";

export type CountrySummary = Country & {
  firstDate: string;
  lastDate: string;
  dayCount: number;
};

/**
 * Distinct countries in first-appearance order, each merged with its place
 * metadata and a date range **derived from the stops** — the single source of
 * truth. Countries missing from the `countries` lookup still render sanely.
 */
export function orderedCountries(): CountrySummary[] {
  const seen = new Set<string>();
  const out: CountrySummary[] = [];
  for (const stop of itinerary) {
    if (seen.has(stop.country)) continue;
    seen.add(stop.country);
    const stops = stopsByCountry(stop.country);
    const dates = stops.map((s) => s.date).sort();
    const meta = countries.find((c) => c.name === stop.country);
    out.push({
      name: stop.country,
      short: meta?.short ?? stop.country,
      accent: meta?.accent ?? stop.accent ?? FALLBACK_ACCENT,
      firstDate: dates[0],
      lastDate: dates[dates.length - 1],
      dayCount: stops.length,
    });
  }
  return out;
}

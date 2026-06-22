import {
  itinerary as BASE,
  KIND_VALUES,
  type Stop,
  type Activity,
} from "@/data/itinerary";
import { kvGet, kvSet } from "./store";
import type { Group } from "./groups";

// Per-group itineraries = a shared owner-curated CORE (the `locked` France days,
// read-only to groups) + a per-group OVERLAY: the group's own stops (cities
// elsewhere) and its own events layered onto core days. Reads merge the two.

export type Overlay = {
  stops: Stop[]; // the group's own stops
  events: Record<string, Activity[]>; // the group's events, keyed by core stop id
};

const CORE_KEY = "itinerary:core";
const overlayKey = (gid: string) => `itinerary:overlay:${gid}`;
const FALLBACK_ACCENT = "#b5654a";

const lockedStops = () => BASE.filter((s) => s.locked);
const unlockedStops = () => BASE.filter((s) => !s.locked);

const byDate = (a: Stop, b: Stop) => a.date.localeCompare(b.date);
// timed items sort by time; un-timed sort to the end (stable keeps their order)
const byTime = (a: Activity, b: Activity) =>
  (a.time ?? "99").localeCompare(b.time ?? "99");

export async function getCore(): Promise<Stop[]> {
  return (await kvGet<Stop[]>(CORE_KEY)) ?? lockedStops();
}

export async function getOverlay(gid: string): Promise<Overlay> {
  const saved = await kvGet<Overlay>(overlayKey(gid));
  if (saved) return saved;
  // The owner's own stops seed from the non-locked base; everyone else starts empty.
  return gid === "owner"
    ? { stops: unlockedStops(), events: {} }
    : { stops: [], events: {} };
}

/** The full, date-ordered itinerary for the current group (base for no cookie). */
export async function resolveItinerary(group: Group | null): Promise<Stop[]> {
  const gid = group?.id ?? "owner";
  const [core, ov] = await Promise.all([getCore(), getOverlay(gid)]);
  const coreMerged = core.map((s) => {
    const added = ov.events[s.id];
    if (!added?.length) return s;
    return { ...s, plan: [...(s.plan ?? []), ...added].sort(byTime) };
  });
  return [...coreMerged, ...ov.stops].sort(byDate);
}

// ── Mutations (validate + persist; owner/group gating lives in the API route) ─
export async function setCore(input: unknown): Promise<Stop[] | null> {
  const clean = cleanStops(input);
  if (!clean.length) return null; // route → 400
  await kvSet(CORE_KEY, clean);
  return clean;
}

export async function setOverlay(gid: string, input: unknown): Promise<Overlay> {
  const core = await getCore();
  const coreIds = new Set(core.map((s) => s.id));
  const clean = cleanOverlay(input, coreIds);
  await kvSet(overlayKey(gid), clean);
  return clean;
}

// ── Validation / sanitization ────────────────────────────────────────────────
const KIND_SET = new Set<string>(KIND_VALUES);

const str = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";
const isHex = (v: unknown): v is string =>
  typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v);
const isDate = (v: unknown): v is string =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
const isTime = (v: unknown): v is string =>
  typeof v === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
function validTz(tz: unknown): tz is string {
  if (typeof tz !== "string") return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

function cleanActivity(a: unknown): Activity | null {
  if (!a || typeof a !== "object") return null;
  const o = a as Record<string, unknown>;
  const title = str(o.title, 140);
  if (!title) return null;
  const act: Activity = { title };
  if (isTime(o.time)) act.time = o.time;
  const note = str(o.note, 280);
  if (note) act.note = note;
  if (typeof o.kind === "string" && KIND_SET.has(o.kind)) {
    act.kind = o.kind as Activity["kind"];
  }
  return act;
}

function cleanStop(s: unknown, seen: Set<string>): Stop | null {
  if (!s || typeof s !== "object") return null;
  const o = s as Record<string, unknown>;
  const city = str(o.city, 80);
  const country = str(o.country, 60);
  const lat = Number(o.lat);
  const lon = Number(o.lon);
  if (!city || !country) return null;
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) return null;
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) return null;
  if (!validTz(o.timezone) || !isDate(o.date)) return null;

  let id =
    typeof o.id === "string" && /^[a-z0-9-]{1,40}$/.test(o.id) ? o.id : "";
  if (!id) {
    id =
      city.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 36) ||
      "stop";
  }
  let unique = id;
  let n = 2;
  while (seen.has(unique)) unique = `${id.slice(0, 36)}-${n++}`;

  const plan = Array.isArray(o.plan)
    ? o.plan.slice(0, 30).map(cleanActivity).filter((a): a is Activity => !!a)
    : undefined;

  return {
    id: unique,
    city,
    country,
    ...(str(o.label, 80) ? { label: str(o.label, 80) } : {}),
    lat,
    lon,
    timezone: o.timezone as string,
    date: o.date as string,
    accent: isHex(o.accent) ? o.accent : FALLBACK_ACCENT,
    ...(plan ? { plan } : {}),
  };
}

function cleanStops(input: unknown): Stop[] {
  const arr = Array.isArray(input) ? input : [];
  const seen = new Set<string>();
  const out: Stop[] = [];
  for (const raw of arr.slice(0, 30)) {
    const stop = cleanStop(raw, seen);
    if (stop) {
      seen.add(stop.id);
      out.push(stop);
    }
  }
  return out;
}

function cleanOverlay(input: unknown, coreIds: Set<string>): Overlay {
  const o = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const stops = cleanStops(o.stops);
  const events: Record<string, Activity[]> = {};
  const evIn = (o.events && typeof o.events === "object" ? o.events : {}) as Record<string, unknown>;
  for (const [stopId, acts] of Object.entries(evIn)) {
    if (!coreIds.has(stopId) || !Array.isArray(acts)) continue; // drop events for non-core stops
    const cleaned = acts.slice(0, 30).map(cleanActivity).filter((a): a is Activity => !!a);
    if (cleaned.length) events[stopId] = cleaned;
  }
  return { stops, events };
}

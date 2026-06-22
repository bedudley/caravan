import { kvGet, kvSet } from "./store";
import { TRIP_NAME } from "@/data/itinerary";

// The vacation title is owner-editable and stored in KV; it falls back to the
// TRIP_NAME baked into the itinerary so there's always a sensible default.
const KEY = "tripTitle";

export async function getTripTitle(): Promise<string> {
  const t = await kvGet<string>(KEY);
  return t && t.trim() ? t : TRIP_NAME;
}

export async function setTripTitle(title: string): Promise<string> {
  const clean = title.trim().slice(0, 80) || TRIP_NAME;
  await kvSet(KEY, clean);
  return clean;
}

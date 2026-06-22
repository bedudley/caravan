// City search via Open-Meteo's free geocoding API (no key), returning exactly
// the fields a Stop needs. Server-only; degrades to [] on any failure.
export type GeoResult = {
  name: string;
  country: string;
  admin1?: string; // region/state, for disambiguation
  lat: number;
  lon: number;
  timezone: string;
};

const BASE = "https://geocoding-api.open-meteo.com/v1/search";

export async function geocode(query: string): Promise<GeoResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  try {
    const url = `${BASE}?name=${encodeURIComponent(q)}&count=6&language=en&format=json`;
    const res = await fetch(url, { next: { revalidate: 86400 } }); // coords don't move
    if (!res.ok) return [];
    const data = (await res.json()) as { results?: Array<Record<string, unknown>> };
    return (data.results ?? [])
      .map((r) => ({
        name: String(r.name ?? ""),
        country: String(r.country ?? ""),
        admin1: r.admin1 ? String(r.admin1) : undefined,
        lat: Number(r.latitude),
        lon: Number(r.longitude),
        timezone: String(r.timezone ?? ""),
      }))
      .filter(
        (r) =>
          r.name &&
          r.country &&
          Number.isFinite(r.lat) &&
          Number.isFinite(r.lon) &&
          r.timezone,
      );
  } catch {
    return [];
  }
}

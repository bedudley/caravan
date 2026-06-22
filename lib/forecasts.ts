import type { Stop } from "@/data/itinerary";
import { fetchForecast, type Forecast } from "@/lib/openMeteo";

// Thin wrappers over fetchForecast (which already sets `next: revalidate 1800`),
// so the home page (all stops) and a day page (one stop) share one entry point.

export function getForecast(stop: Stop): Promise<Forecast | null> {
  return fetchForecast(stop);
}

export function getAllForecasts(stops: Stop[]): Promise<(Forecast | null)[]> {
  return Promise.all(stops.map(fetchForecast));
}

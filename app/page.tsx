import { TRIP_SUBTITLE } from "@/data/itinerary";
import { getAllForecasts } from "@/lib/forecasts";
import { getTripStatus, orderedCountries } from "@/lib/trip";
import { getTripTitle } from "@/lib/trip-meta";
import { resolveItinerary } from "@/lib/itinerary";
import { currentGroup } from "@/lib/groups";
import TripBoard from "@/components/TripBoard";

export const dynamic = "force-dynamic"; // per-group itinerary depends on the cookie

export default async function Home() {
  const group = await currentGroup();
  const tripStops = await resolveItinerary(group);

  const forecasts = await getAllForecasts(tripStops);
  const stops = tripStops.map((stop, i) => ({ stop, forecast: forecasts[i] }));

  const { todayIndex, status, featuredIndex, daysUntil } = getTripStatus(tripStops);
  const countries = orderedCountries(tripStops);
  const tripName = await getTripTitle();

  return (
    <TripBoard
      tripName={tripName}
      subtitle={TRIP_SUBTITLE}
      stops={stops}
      featuredIndex={featuredIndex}
      todayIndex={todayIndex}
      status={status}
      daysUntil={daysUntil}
      countries={countries}
    />
  );
}

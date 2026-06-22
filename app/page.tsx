import { itinerary, TRIP_SUBTITLE } from "@/data/itinerary";
import { getAllForecasts } from "@/lib/forecasts";
import { getTripStatus, orderedCountries } from "@/lib/trip";
import { getTripTitle } from "@/lib/trip-meta";
import TripBoard from "@/components/TripBoard";

export const revalidate = 1800;

export default async function Home() {
  const forecasts = await getAllForecasts(itinerary);
  const stops = itinerary.map((stop, i) => ({ stop, forecast: forecasts[i] }));

  const { todayIndex, status, featuredIndex, daysUntil } = getTripStatus();
  const countries = orderedCountries();
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

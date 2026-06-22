import { itinerary, TRIP_NAME, TRIP_SUBTITLE } from "@/data/itinerary";
import { getAllForecasts } from "@/lib/forecasts";
import { getTripStatus, orderedCountries } from "@/lib/trip";
import TripBoard from "@/components/TripBoard";

export const revalidate = 1800;

export default async function Home() {
  const forecasts = await getAllForecasts(itinerary);
  const stops = itinerary.map((stop, i) => ({ stop, forecast: forecasts[i] }));

  const { todayIndex, status, featuredIndex, daysUntil } = getTripStatus();
  const countries = orderedCountries();

  return (
    <TripBoard
      tripName={TRIP_NAME}
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

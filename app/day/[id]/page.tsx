import { notFound } from "next/navigation";
import { adjacentStops, dateInTz, findStop } from "@/lib/trip";
import { getForecast } from "@/lib/forecasts";
import { resolveItinerary } from "@/lib/itinerary";
import { currentGroup } from "@/lib/groups";
import DayView from "@/components/DayView";

export const dynamic = "force-dynamic"; // per-group itinerary depends on the cookie

export default async function DayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const group = await currentGroup();
  const stops = await resolveItinerary(group);

  const stop = findStop(stops, id);
  if (!stop) notFound();

  const forecast = await getForecast(stop);
  const { prev, next } = adjacentStops(stops, id);
  const isToday = stop.date === dateInTz(stop.timezone);

  return (
    <DayView
      stop={stop}
      forecast={forecast}
      prev={prev}
      next={next}
      isToday={isToday}
    />
  );
}

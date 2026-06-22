import { notFound } from "next/navigation";
import { itinerary } from "@/data/itinerary";
import { adjacentStops, dateInTz, findStop } from "@/lib/trip";
import { getForecast } from "@/lib/forecasts";
import DayView from "@/components/DayView";

export const revalidate = 1800;

export function generateStaticParams() {
  return itinerary.map((s) => ({ id: s.id }));
}

export default async function DayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const stop = findStop(id);
  if (!stop) notFound();

  const forecast = await getForecast(stop);
  const { prev, next } = adjacentStops(id);
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

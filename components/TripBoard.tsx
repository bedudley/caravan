"use client";

import { useState } from "react";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { Stop } from "@/data/itinerary";
import type { Forecast } from "@/lib/openMeteo";
import type { CountrySummary } from "@/lib/trip";
import { formatDateRange } from "@/lib/format";
import { useUnit } from "@/lib/useUnit";
import FeaturedStop from "./FeaturedStop";
import StopCard from "./StopCard";
import UnitToggle from "./UnitToggle";
import LiveClock from "./LiveClock";
import NotesSection from "./NotesSection";
import BoardLink from "./BoardLink";

type Entry = { stop: Stop; forecast: Forecast | null };
type Status = "before" | "during" | "after";

export default function TripBoard({
  tripName,
  subtitle,
  stops,
  featuredIndex,
  todayIndex,
  status,
  daysUntil,
  countries,
}: {
  tripName: string;
  subtitle: string;
  stops: Entry[];
  featuredIndex: number;
  todayIndex: number;
  status: Status;
  daysUntil: number;
  countries: CountrySummary[];
}) {
  const [unit, toggle] = useUnit();
  const [activeCountry, setActiveCountry] = useState<string | null>(null);

  const featured = stops[featuredIndex];
  const todayId = todayIndex >= 0 ? stops[todayIndex]?.stop.id : undefined;

  const statusLine =
    status === "before"
      ? daysUntil <= 1
        ? "Trip begins tomorrow"
        : `Trip begins in ${daysUntil} days`
      : status === "during"
        ? `Day ${todayIndex + 1} of ${stops.length}`
        : "Hope it was wonderful ✦";

  const shownCountries = countries.filter(
    (c) => !activeCountry || c.name === activeCountry,
  );

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-16 pt-6 sm:pt-10">
      <header className="mb-6 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-2xl text-wine sm:text-3xl">
            {tripName}
          </h1>
          <p className="text-sm text-muted">{subtitle}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-accent">
            {statusLine}
          </p>
          {featured && (
            <LiveClock
              tripCity={featured.stop.city}
              tripTz={featured.stop.timezone}
            />
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <BoardLink />
          <UnitToggle unit={unit} onToggle={toggle} />
        </div>
      </header>

      {featured && (
        <Link href={`/day/${featured.stop.id}`} className="block">
          <FeaturedStop entry={featured} unit={unit} isToday={status === "during"} />
        </Link>
      )}

      <NotesSection scope="trip" />

      {/* Country filter */}
      <div className="no-scrollbar mt-7 -mx-4 flex gap-2 overflow-x-auto px-4">
        <FilterChip
          label="All"
          active={activeCountry === null}
          onClick={() => setActiveCountry(null)}
        />
        {countries.map((c) => (
          <FilterChip
            key={c.name}
            label={c.short}
            accent={c.accent}
            active={activeCountry === c.name}
            onClick={() => setActiveCountry(c.name)}
          />
        ))}
      </div>

      {/* Grouped day list */}
      <div className="mt-5 flex flex-col gap-6">
        {shownCountries.map((c) => {
          const groupStops = stops.filter((e) => e.stop.country === c.name);
          return (
            <section key={c.name}>
              <div className="mb-2.5 flex items-baseline justify-between px-1">
                <h3 className="flex items-center gap-2 font-display text-base text-wine">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: c.accent }}
                  />
                  {c.name}
                </h3>
                <span className="text-xs text-faint">
                  {formatDateRange(c.firstDate, c.lastDate)} ·{" "}
                  {c.dayCount} {c.dayCount > 1 ? "days" : "day"}
                </span>
              </div>
              <div className="flex flex-col gap-2.5">
                {groupStops.map((entry) => (
                  <Link
                    key={entry.stop.id}
                    href={`/day/${entry.stop.id}`}
                    className="block rounded-card transition active:scale-[0.99]"
                  >
                    <StopCard
                      entry={entry}
                      unit={unit}
                      isToday={entry.stop.id === todayId}
                    />
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <footer className="mt-10 text-center text-xs text-faint">
        Weather by Open‑Meteo · refreshes every 30 min
      </footer>
    </div>
  );
}

function FilterChip({
  label,
  active,
  accent,
  onClick,
}: {
  label: string;
  active: boolean;
  accent?: string;
  onClick: () => void;
}) {
  const activeStyle: CSSProperties =
    active && accent ? { backgroundColor: accent, borderColor: "transparent" } : {};
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
        active
          ? accent
            ? "text-white"
            : "border-transparent bg-accent text-white"
          : "border-line bg-card text-muted"
      }`}
      style={activeStyle}
    >
      {label}
    </button>
  );
}

"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Stop } from "@/data/itinerary";
import type { Forecast } from "@/lib/openMeteo";
import { formatDay } from "@/lib/format";
import { useUnit } from "@/lib/useUnit";
import FeaturedStop from "./FeaturedStop";
import DayTimeline from "./DayTimeline";
import UnitToggle from "./UnitToggle";
import NotesSection from "./NotesSection";

export default function DayView({
  stop,
  forecast,
  prev,
  next,
  isToday,
}: {
  stop: Stop;
  forecast: Forecast | null;
  prev?: Stop;
  next?: Stop;
  isToday: boolean;
}) {
  const [unit, toggle] = useUnit();

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-16 pt-6 sm:pt-8">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm font-medium text-muted transition hover:text-ink"
        >
          <ChevronLeft size={16} /> Trip
        </Link>
        <UnitToggle unit={unit} onToggle={toggle} />
      </div>

      <FeaturedStop entry={{ stop, forecast }} unit={unit} isToday={isToday} />

      <DayTimeline stop={stop} forecast={forecast} unit={unit} />

      <NotesSection scope={`day:${stop.id}`} />

      <nav className="mt-8 grid grid-cols-2 gap-3">
        {prev ? <DayNavLink dir="prev" stop={prev} /> : <span />}
        {next ? <DayNavLink dir="next" stop={next} /> : <span />}
      </nav>
    </div>
  );
}

function DayNavLink({ dir, stop }: { dir: "prev" | "next"; stop: Stop }) {
  const isNext = dir === "next";
  return (
    <Link
      href={`/day/${stop.id}`}
      className={`flex items-center gap-2 rounded-card border border-line bg-card px-4 py-3 transition active:scale-[0.99] ${
        isNext ? "justify-end text-right" : ""
      }`}
    >
      {!isNext && <ChevronLeft size={18} className="shrink-0 text-faint" />}
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wide text-faint">
          {isNext ? "Next" : "Previous"}
        </div>
        <div className="truncate font-display text-sm text-wine">{stop.city}</div>
        <div className="truncate text-xs text-muted">{formatDay(stop.date)}</div>
      </div>
      {isNext && <ChevronRight size={18} className="shrink-0 text-faint" />}
    </Link>
  );
}

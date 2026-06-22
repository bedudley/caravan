import type { CSSProperties } from "react";
import { Droplets } from "lucide-react";
import type { Stop } from "@/data/itinerary";
import { dayForecast, type Forecast } from "@/lib/openMeteo";
import { describeWeather } from "@/lib/weather";
import { formatDay, formatTemp, type Unit } from "@/lib/format";
import WeatherGlyph from "./WeatherGlyph";

type Entry = { stop: Stop; forecast: Forecast | null };

export default function StopCard({
  entry,
  unit,
  isToday,
}: {
  entry: Entry;
  unit: Unit;
  isToday: boolean;
}) {
  const { stop, forecast } = entry;
  const day = forecast ? dayForecast(forecast, stop.date) : undefined;
  const code = day?.code ?? 3;
  const desc = describeWeather(code);

  const cardStyle: CSSProperties = isToday
    ? { boxShadow: `0 0 0 2px ${stop.accent}` }
    : {};

  return (
    <div
      className={`flex items-center gap-4 rounded-card bg-card px-4 py-3.5 ${
        isToday ? "border border-transparent" : "border border-line"
      }`}
      style={cardStyle}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${stop.accent}1f`, color: stop.accent }}
      >
        <WeatherGlyph code={code} isDay size={22} strokeWidth={1.75} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-display text-lg leading-tight text-wine">
            {stop.city}
          </span>
          {isToday && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
              style={{ backgroundColor: stop.accent }}
            >
              Today
            </span>
          )}
        </div>
        <div className="truncate text-sm text-muted">
          {formatDay(stop.date)}
          {stop.label ? ` · ${stop.label}` : ""}
        </div>
      </div>

      <div className="flex items-center gap-3 text-right">
        <div className="hidden text-right sm:block">
          <div className="text-xs text-faint">{desc.label}</div>
          {day && day.precipProb >= 20 && (
            <div
              className="flex items-center justify-end gap-1 text-xs"
              style={{ color: stop.accent }}
            >
              <Droplets size={12} /> {day.precipProb}%
            </div>
          )}
        </div>
        {day ? (
          <div className="tabular-nums">
            <span className="text-lg font-semibold text-ink">
              {formatTemp(day.maxC, unit)}
            </span>
            <span className="ml-1 text-sm text-faint">
              {formatTemp(day.minC, unit)}
            </span>
          </div>
        ) : (
          <span className="text-sm text-faint">—</span>
        )}
      </div>
    </div>
  );
}

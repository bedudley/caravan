import type { ReactNode } from "react";
import { Droplets, Wind, Sunrise, Sunset, Thermometer } from "lucide-react";
import type { Stop } from "@/data/itinerary";
import { dayForecast, hoursForDate, type Forecast } from "@/lib/openMeteo";
import { describeWeather, moodTheme } from "@/lib/weather";
import WeatherGlyph from "./WeatherGlyph";
import {
  formatClock,
  formatDay,
  formatHour,
  formatTemp,
  type Unit,
} from "@/lib/format";

type Entry = { stop: Stop; forecast: Forecast | null };

function Chip({ children, dark }: { children: ReactNode; dark: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
        dark ? "bg-white/15 text-white" : "bg-black/[0.06] text-ink"
      }`}
    >
      {children}
    </span>
  );
}

export default function FeaturedStop({
  entry,
  unit,
  isToday,
}: {
  entry: Entry;
  unit: Unit;
  isToday: boolean;
}) {
  const { stop, forecast } = entry;

  if (!forecast) {
    return (
      <section className="rounded-[1.75rem] border border-line bg-card p-7">
        <div className="font-display text-2xl text-ink">{stop.city}</div>
        <p className="mt-2 text-sm text-muted">
          Couldn’t load the forecast right now — pull to refresh in a bit.
        </p>
      </section>
    );
  }

  const day = dayForecast(forecast, stop.date);
  const cur = forecast.current;

  const useCurrent = isToday;
  const code = useCurrent ? cur.code : day?.code ?? 3;
  const isDay = useCurrent ? cur.isDay : true;
  const desc = describeWeather(code);
  const theme = moodTheme(desc.mood, isDay);

  const bigC = useCurrent ? cur.tempC : day?.maxC ?? cur.tempC;
  const dark = theme.onDark;
  const textMain = dark ? "text-white" : "text-ink";
  const textSoft = dark ? "text-white/80" : "text-ink/65";

  // Every other hour keeps the strip readable on a phone.
  const hours = hoursForDate(forecast, stop.date).filter((_, i) => i % 2 === 0);

  return (
    <section
      className="overflow-hidden rounded-[1.75rem] p-6 shadow-sm ring-1 ring-black/5 sm:p-7"
      style={{ backgroundImage: theme.gradient }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div
            className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${textSoft}`}
          >
            {isToday ? "Right now" : "Forecast"} · {stop.country}
          </div>
          <h2 className={`font-display text-3xl sm:text-4xl ${textMain}`}>
            {stop.city}
          </h2>
          <div className={`mt-0.5 text-sm ${textSoft}`}>
            {formatDay(stop.date)}
            {stop.label ? ` · ${stop.label}` : ""}
          </div>
        </div>
        <WeatherGlyph
          code={code}
          isDay={isDay}
          size={56}
          strokeWidth={1.5}
          className={`${textMain} shrink-0`}
        />
      </div>

      <div className="mt-5 flex items-end gap-4">
        <div
          className={`font-display text-7xl leading-none tabular-nums ${textMain}`}
        >
          {formatTemp(bigC, unit)}
        </div>
        <div className="pb-2">
          <div className={`text-base font-medium ${textMain}`}>{desc.label}</div>
          {day && (
            <div className={`text-sm ${textSoft}`}>
              H {formatTemp(day.maxC, unit)} · L {formatTemp(day.minC, unit)}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {useCurrent && (
          <Chip dark={dark}>
            <Thermometer size={13} /> Feels {formatTemp(cur.apparentC, unit)}
          </Chip>
        )}
        {day && (
          <Chip dark={dark}>
            <Droplets size={13} /> {day.precipProb}% rain
          </Chip>
        )}
        {useCurrent && (
          <Chip dark={dark}>
            <Wind size={13} /> {Math.round(cur.windKmh)} km/h
          </Chip>
        )}
        {day && (
          <Chip dark={dark}>
            <Sunrise size={13} /> {formatClock(day.sunrise)}
          </Chip>
        )}
        {day && (
          <Chip dark={dark}>
            <Sunset size={13} /> {formatClock(day.sunset)}
          </Chip>
        )}
      </div>

      {hours.length > 0 && (
        <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1">
          {hours.map((h) => {
            return (
              <div
                key={h.time}
                className={`flex min-w-[3.25rem] flex-col items-center gap-1 rounded-2xl px-2 py-2.5 ${
                  dark ? "bg-white/10" : "bg-black/[0.05]"
                }`}
              >
                <span className={`text-[11px] ${textSoft}`}>
                  {formatHour(h.time)}
                </span>
                <WeatherGlyph code={h.code} isDay={h.isDay} size={18} className={textMain} />
                <span
                  className={`text-sm font-semibold tabular-nums ${textMain}`}
                >
                  {formatTemp(h.tempC, unit)}
                </span>
                <span
                  className={`text-[10px] ${textSoft} ${
                    h.precipProb >= 20 ? "" : "invisible"
                  }`}
                >
                  {h.precipProb}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

import { Droplets } from "lucide-react";
import type { Stop } from "@/data/itinerary";
import { hoursForDate, type Forecast } from "@/lib/openMeteo";
import { formatTemp, type Unit } from "@/lib/format";
import WeatherGlyph from "./WeatherGlyph";
import KindIcon from "./KindIcon";

/** "09:30" → "9:30 AM" */
function timeLabel(hm: string): string {
  const h = Number(hm.slice(0, 2));
  const m = hm.slice(3, 5);
  const period = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${period}`;
}

export default function DayTimeline({
  stop,
  forecast,
  unit,
}: {
  stop: Stop;
  forecast: Forecast | null;
  unit: Unit;
}) {
  const plan = stop.plan ?? [];
  const hours = forecast ? hoursForDate(forecast, stop.date) : [];

  function weatherAt(hm?: string) {
    if (!hm) return undefined;
    const hour = Number(hm.slice(0, 2));
    return hours.find((h) => Number(h.time.slice(11, 13)) === hour);
  }

  return (
    <section className="mt-6">
      <h3 className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.16em] text-faint">
        The day
      </h3>

      {plan.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-card/60 px-4 py-6 text-center text-sm text-muted">
          No plans added for this day yet.
        </div>
      ) : (
        <ol className="flex flex-col">
          {plan.map((a, i) => {
            const w = weatherAt(a.time);
            const last = i === plan.length - 1;
            return (
              <li key={`${a.title}-${i}`} className="flex gap-3">
                {/* timeline rail */}
                <div className="flex flex-col items-center pt-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: stop.accent }}
                  />
                  {!last && <span className="w-px flex-1 bg-line" />}
                </div>

                <div className={`flex-1 ${last ? "" : "pb-3"}`}>
                  <div className="flex items-start justify-between gap-3 rounded-card border border-line bg-card px-4 py-3">
                    <div className="min-w-0 flex-1">
                      {a.time && (
                        <div className="text-xs font-medium text-faint">
                          {timeLabel(a.time)}
                        </div>
                      )}
                      <div className="flex items-start gap-1.5 font-medium text-ink">
                        <span
                          className="mt-0.5 shrink-0"
                          style={{ color: stop.accent }}
                        >
                          <KindIcon kind={a.kind} size={15} />
                        </span>
                        <span className="min-w-0 break-words">{a.title}</span>
                      </div>
                      {a.note && (
                        <div className="mt-0.5 text-sm text-muted">{a.note}</div>
                      )}
                    </div>

                    {w && (
                      <div className="flex shrink-0 items-center gap-1.5 text-sm">
                        <WeatherGlyph
                          code={w.code}
                          isDay={w.isDay}
                          size={18}
                          className="text-ink"
                        />
                        <span className="font-semibold tabular-nums text-ink">
                          {formatTemp(w.tempC, unit)}
                        </span>
                        {w.precipProb >= 20 && (
                          <span
                            className="flex items-center gap-0.5 text-xs"
                            style={{ color: stop.accent }}
                          >
                            <Droplets size={11} />
                            {w.precipProb}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

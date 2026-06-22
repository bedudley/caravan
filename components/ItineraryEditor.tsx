"use client";

import { useState } from "react";
import type { Stop, Activity } from "@/data/itinerary";
import type { GeoResult } from "@/lib/geocode";
import { formatDay } from "@/lib/format";
import KindIcon from "./KindIcon";
import ActivityEditor from "./ActivityEditor";
import PlaceSearch from "./PlaceSearch";
import { Lock, Plus, Trash2, Check, Loader2, MapPin } from "lucide-react";

type Overlay = { stops: Stop[]; events: Record<string, Activity[]> };
type Me = { id: string; name: string; owner: boolean };

const NEW_ACCENT = "#6f87a3"; // dusty blue for new stops (changeable later)
const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : "s-" + Math.random().toString(36).slice(2, 10);

function timeLabel(hm?: string) {
  if (!hm) return "";
  const h = Number(hm.slice(0, 2));
  return `${h % 12 === 0 ? 12 : h % 12}:${hm.slice(3, 5)} ${h < 12 ? "AM" : "PM"}`;
}

export default function ItineraryEditor({
  core,
  overlay,
}: {
  core: Stop[];
  overlay: Overlay;
  me: Me;
}) {
  const [ov, setOv] = useState<Overlay>(overlay);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const mutate = (next: Overlay) => {
    setOv(next);
    setDirty(true);
    setSaved(false);
  };

  // ── events added to a core day ────────────────────────────────────────────
  const setEvents = (stopId: string, acts: Activity[]) => {
    const events = { ...ov.events };
    if (acts.length) events[stopId] = acts;
    else delete events[stopId];
    mutate({ ...ov, events });
  };
  const eventsFor = (stopId: string) => ov.events[stopId] ?? [];
  const move = <T,>(arr: T[], i: number, dir: number) => {
    const j = i + dir;
    if (j < 0 || j >= arr.length) return arr;
    const out = [...arr];
    [out[i], out[j]] = [out[j], out[i]];
    return out;
  };

  // ── your own stops ─────────────────────────────────────────────────────────
  const setStops = (stops: Stop[]) => mutate({ ...ov, stops });
  const addStop = (r: GeoResult) =>
    setStops([
      ...ov.stops,
      {
        id: newId(),
        city: r.name,
        country: r.country,
        lat: r.lat,
        lon: r.lon,
        timezone: r.timezone,
        date: core[0]?.date ?? new Date().toISOString().slice(0, 10),
        accent: NEW_ACCENT,
        plan: [],
      },
    ]);
  const patchStop = (id: string, patch: Partial<Stop>) =>
    setStops(ov.stops.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const setStopPlan = (id: string, plan: Activity[]) => patchStop(id, { plan });
  const planFor = (s: Stop) => s.plan ?? [];

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: "overlay", overlay: ov }),
      });
      if (res.ok) {
        const d = (await res.json()) as { overlay: Overlay };
        setOv(d.overlay);
        setDirty(false);
        setSaved(true);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pb-24">
      <p className="mb-5 text-sm text-muted">
        Add your own events to the shared France days, and add your own stops for
        cities beyond France. Only your group sees these.
      </p>

      {/* ── The shared core ── */}
      <h2 className="mb-2 flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-[0.16em] text-faint">
        The trip <Lock size={11} /> shared
      </h2>
      <div className="flex flex-col gap-3">
        {core.map((s) => {
          const yours = eventsFor(s.id);
          return (
            <div key={s.id} className="rounded-card border border-line bg-card p-3">
              <div className="mb-1.5">
                <div className="font-display text-base text-wine">{s.city}</div>
                <div className="text-xs text-faint">{formatDay(s.date)}</div>
              </div>
              {/* official activities — read-only */}
              {planFor(s).map((a, i) => (
                <div
                  key={`o-${i}`}
                  className="flex items-start gap-1.5 py-0.5 text-sm text-muted"
                >
                  <span className="mt-0.5 shrink-0 text-faint">
                    <KindIcon kind={a.kind} size={13} />
                  </span>
                  <span className="min-w-0">
                    {a.time && <span className="text-faint">{timeLabel(a.time)} · </span>}
                    {a.title}
                  </span>
                </div>
              ))}
              {/* your added events — editable */}
              {yours.length > 0 && (
                <div className="mt-2 flex flex-col gap-2">
                  {yours.map((a, i) => (
                    <ActivityEditor
                      key={`y-${i}`}
                      activity={a}
                      onChange={(x) =>
                        setEvents(s.id, yours.map((v, j) => (j === i ? x : v)))
                      }
                      onRemove={() => setEvents(s.id, yours.filter((_, j) => j !== i))}
                      onUp={i > 0 ? () => setEvents(s.id, move(yours, i, -1)) : undefined}
                      onDown={
                        i < yours.length - 1
                          ? () => setEvents(s.id, move(yours, i, 1))
                          : undefined
                      }
                    />
                  ))}
                </div>
              )}
              <button
                onClick={() => setEvents(s.id, [...yours, { title: "" }])}
                className="mt-2 flex items-center gap-1.5 text-xs font-medium text-accent transition hover:opacity-80"
              >
                <Plus size={13} /> Add your event
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Your stops ── */}
      <h2 className="mb-2 mt-7 px-1 text-xs font-semibold uppercase tracking-[0.16em] text-faint">
        Your stops
      </h2>
      <div className="flex flex-col gap-3">
        {ov.stops.length === 0 && (
          <p className="px-1 text-sm text-faint">
            None yet — add a city you&apos;re visiting below.
          </p>
        )}
        {ov.stops.map((s) => {
          const plan = planFor(s);
          return (
            <div key={s.id} className="rounded-card border border-line bg-card p-3">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 font-display text-base text-wine">
                    <MapPin size={14} className="text-accent" /> {s.city}
                  </div>
                  <div className="text-xs text-faint">{s.country}</div>
                </div>
                <button
                  onClick={() => setStops(ov.stops.filter((x) => x.id !== s.id))}
                  className="flex items-center gap-1 text-xs text-faint transition hover:text-accent"
                >
                  <Trash2 size={12} /> Remove
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  value={s.date}
                  onChange={(e) => patchStop(s.id, { date: e.target.value })}
                  className="rounded border border-line bg-paper px-2 py-1 text-xs text-ink outline-none focus:border-accent"
                />
                <input
                  value={s.label ?? ""}
                  onChange={(e) => patchStop(s.id, { label: e.target.value || undefined })}
                  placeholder="Label (optional)"
                  className="min-w-0 flex-1 rounded border border-line bg-paper px-2 py-1 text-xs text-ink outline-none focus:border-accent"
                />
              </div>
              {plan.length > 0 && (
                <div className="mt-2 flex flex-col gap-2">
                  {plan.map((a, i) => (
                    <ActivityEditor
                      key={`p-${i}`}
                      activity={a}
                      onChange={(x) =>
                        setStopPlan(s.id, plan.map((v, j) => (j === i ? x : v)))
                      }
                      onRemove={() => setStopPlan(s.id, plan.filter((_, j) => j !== i))}
                      onUp={i > 0 ? () => setStopPlan(s.id, move(plan, i, -1)) : undefined}
                      onDown={
                        i < plan.length - 1
                          ? () => setStopPlan(s.id, move(plan, i, 1))
                          : undefined
                      }
                    />
                  ))}
                </div>
              )}
              <button
                onClick={() => setStopPlan(s.id, [...plan, { title: "" }])}
                className="mt-2 flex items-center gap-1.5 text-xs font-medium text-accent transition hover:opacity-80"
              >
                <Plus size={13} /> Add activity
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-3 px-1">
        <PlaceSearch onPick={addStop} placeholder="Add a city you're visiting…" />
      </div>

      {/* ── sticky save bar ── */}
      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3 px-4 py-3">
          <span className="text-xs text-faint">
            {dirty ? "Unsaved changes" : saved ? "Saved ✓" : "All changes saved"}
          </span>
          <button
            onClick={save}
            disabled={!dirty || saving}
            className="flex items-center gap-1.5 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

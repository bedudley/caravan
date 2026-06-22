"use client";

import { KIND_VALUES, type Activity } from "@/data/itinerary";
import KindIcon from "./KindIcon";
import { Trash2, ChevronUp, ChevronDown } from "lucide-react";

// One editable activity row (time, kind, title, note). Fully controlled.
export default function ActivityEditor({
  activity,
  onChange,
  onRemove,
  onUp,
  onDown,
}: {
  activity: Activity;
  onChange: (a: Activity) => void;
  onRemove: () => void;
  onUp?: () => void;
  onDown?: () => void;
}) {
  const set = (patch: Partial<Activity>) => onChange({ ...activity, ...patch });

  return (
    <div className="rounded-lg border border-line bg-paper p-2.5">
      <div className="flex items-center gap-2">
        <input
          type="time"
          value={activity.time ?? ""}
          onChange={(e) => set({ time: e.target.value || undefined })}
          className="shrink-0 rounded border border-line bg-card px-1.5 py-1 text-xs text-ink outline-none focus:border-accent"
        />
        <input
          value={activity.title}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="What's happening?"
          className="min-w-0 flex-1 rounded border border-line bg-card px-2 py-1 text-sm text-ink outline-none focus:border-accent"
        />
        {onUp && (
          <button onClick={onUp} aria-label="Move up" className="shrink-0 text-faint transition hover:text-ink">
            <ChevronUp size={15} />
          </button>
        )}
        {onDown && (
          <button onClick={onDown} aria-label="Move down" className="shrink-0 text-faint transition hover:text-ink">
            <ChevronDown size={15} />
          </button>
        )}
        <button onClick={onRemove} aria-label="Remove" className="shrink-0 text-faint transition hover:text-accent">
          <Trash2 size={14} />
        </button>
      </div>
      <input
        value={activity.note ?? ""}
        onChange={(e) => set({ note: e.target.value || undefined })}
        placeholder="Note (optional)"
        className="mt-1.5 w-full rounded border border-line bg-card px-2 py-1 text-xs text-muted outline-none focus:border-accent"
      />
      <div className="no-scrollbar mt-1.5 flex gap-1 overflow-x-auto">
        {KIND_VALUES.map((k) => (
          <button
            key={k}
            onClick={() => set({ kind: k })}
            title={k}
            aria-label={k}
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition ${
              activity.kind === k
                ? "border-transparent bg-accent text-white"
                : "border-line bg-card text-muted hover:text-ink"
            }`}
          >
            <KindIcon kind={k} size={14} />
          </button>
        ))}
      </div>
    </div>
  );
}

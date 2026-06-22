"use client";

import { useEffect, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import type { GeoResult } from "@/lib/geocode";

// Debounced city search → calls /api/geocode → a dropdown of places. onPick gets
// the chosen place (name/country/lat/lon/timezone) to seed a Stop.
export default function PlaceSearch({
  onPick,
  placeholder = "Search a city…",
}: {
  onPick: (r: GeoResult) => void;
  placeholder?: string;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (q.trim().length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      return;
    }
    let alive = true;
    setLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/geocode?q=${encodeURIComponent(q)}`)
        .then((r) => (r.ok ? r.json() : { results: [] }))
        .then((d) => {
          if (alive) setResults(d.results ?? []);
        })
        .catch(() => {})
        .finally(() => {
          if (alive) setLoading(false);
        });
    }, 350);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [q]);

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-lg border border-line bg-paper px-3 py-2">
        {loading ? (
          <Loader2 size={15} className="animate-spin text-faint" />
        ) : (
          <Search size={15} className="text-faint" />
        )}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          autoCapitalize="words"
          className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none"
        />
      </div>
      {results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-line bg-card shadow-sm">
          {results.map((r, i) => (
            <button
              key={`${r.name}-${r.lat}-${i}`}
              onClick={() => {
                onPick(r);
                setQ("");
                setResults([]);
              }}
              className="block w-full border-b border-line px-3 py-2 text-left text-sm last:border-0 hover:bg-paper"
            >
              <span className="font-medium text-ink">{r.name}</span>
              <span className="text-muted">
                {" · "}
                {r.admin1 ? `${r.admin1}, ` : ""}
                {r.country}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

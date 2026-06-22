"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import type { Stop, Activity } from "@/data/itinerary";
import CaravanMark from "@/components/CaravanMark";
import ItineraryEditor from "@/components/ItineraryEditor";

type Overlay = { stops: Stop[]; events: Record<string, Activity[]> };
type Data = {
  core: Stop[];
  overlay: Overlay;
  group: { id: string; name: string; owner: boolean } | null;
};

export default function EditPage() {
  const [data, setData] = useState<Data | null>(null);
  const [status, setStatus] = useState<"loading" | "gated" | "ready">("loading");
  const [code, setCode] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [err, setErr] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/itinerary", { cache: "no-store" });
    if (res.ok) {
      const d = (await res.json()) as Data;
      setData(d);
      setStatus(d.group ? "ready" : "gated");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function unlock() {
    if (!code.trim()) return;
    setUnlocking(true);
    setErr(false);
    try {
      const res = await fetch("/api/notes/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        setCode("");
        await load();
      } else {
        setErr(true);
      }
    } finally {
      setUnlocking(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-xl px-4 py-8">
      <CaravanMark />
      <div className="mt-3 flex items-baseline justify-between">
        <h1 className="font-display text-3xl text-wine">Edit your trip</h1>
        <Link href="/" className="text-sm text-muted transition hover:text-ink">
          Done
        </Link>
      </div>

      {status === "gated" && (
        <div className="mt-6 rounded-card border border-line bg-card p-5">
          <div className="flex items-center gap-1.5 text-sm font-medium text-ink">
            <Lock size={14} /> Travelers only
          </div>
          <p className="mt-1 text-sm text-muted">
            Enter your group code to customize your itinerary.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <input
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setErr(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && unlock()}
              placeholder="Group code"
              autoCapitalize="off"
              className={`min-w-0 flex-1 rounded-full border bg-paper px-3 py-2 text-sm outline-none focus:border-accent ${
                err ? "border-accent" : "border-line"
              }`}
            />
            <button
              onClick={unlock}
              disabled={unlocking || !code.trim()}
              className="shrink-0 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {unlocking ? "…" : "Enter"}
            </button>
          </div>
          <p className="mt-3 text-xs text-faint">
            New here?{" "}
            <Link href="/join" className="text-accent hover:underline">
              Join the trip →
            </Link>
          </p>
        </div>
      )}

      {status === "ready" && data?.group && (
        <div className="mt-5">
          <ItineraryEditor core={data.core} overlay={data.overlay} me={data.group} />
        </div>
      )}
    </main>
  );
}

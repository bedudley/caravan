"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import CaravanMark from "@/components/CaravanMark";
import InvitePanel from "@/components/InvitePanel";
import AddGroup from "@/components/AddGroup";

// Owner hub for onboarding: the shared invite link/code + adding groups.
export default function PeoplePage() {
  const [status, setStatus] = useState<"loading" | "gated" | "denied" | "ready">(
    "loading",
  );
  const [groupName, setGroupName] = useState("");
  const [code, setCode] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [err, setErr] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/notes?scope=trip", { cache: "no-store" });
    if (res.ok) {
      const g = (await res.json()).group as { name: string; owner: boolean } | null;
      if (!g) setStatus("gated");
      else if (!g.owner) {
        setGroupName(g.name);
        setStatus("denied");
      } else setStatus("ready");
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

  async function signOut() {
    await fetch("/api/notes/lock", { method: "POST" });
    await load();
  }

  return (
    <main className="mx-auto min-h-screen max-w-xl px-4 py-8">
      <CaravanMark />
      <div className="mt-3 flex items-baseline justify-between">
        <h1 className="font-display text-3xl text-wine">People</h1>
        <Link href="/" className="text-sm text-muted transition hover:text-ink">
          Done
        </Link>
      </div>

      {status === "gated" && (
        <div className="mt-6 rounded-card border border-line bg-card p-5">
          <div className="flex items-center gap-1.5 text-sm font-medium text-ink">
            <Lock size={14} /> Owner sign-in
          </div>
          <p className="mt-1 text-sm text-muted">
            Enter your owner code to invite people and manage groups.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <input
              type="password"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setErr(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && unlock()}
              placeholder="Owner code"
              autoFocus
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
        </div>
      )}

      {status === "denied" && (
        <div className="mt-6 rounded-card border border-line bg-card p-5">
          <p className="text-sm text-ink">
            You&apos;re signed in as{" "}
            <span className="font-medium">{groupName}</span>. This area is just for
            the trip owner.
          </p>
          <button
            onClick={signOut}
            className="mt-3 text-xs text-faint transition hover:text-muted"
          >
            Sign out
          </button>
        </div>
      )}

      {status === "ready" && (
        <div className="mt-5 flex flex-col gap-5">
          <p className="text-sm text-muted">
            Bring people onto the trip — share the invite link so they self-join, or
            add a group by hand.
          </p>
          <InvitePanel />
          <AddGroup />
          <button
            onClick={signOut}
            className="self-start text-xs text-faint transition hover:text-muted"
          >
            Sign out
          </button>
        </div>
      )}
    </main>
  );
}

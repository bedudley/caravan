"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, MessagesSquare, Users, LogIn, LogOut } from "lucide-react";

type Group = { id: string; name: string; owner: boolean } | null;

// The header account/nav: sign in when locked; Edit / Board / People (owner) +
// sign-out when unlocked. One fetch for the whole contextual nav.
export default function HeaderNav() {
  const [group, setGroup] = useState<Group>(null);
  const [loaded, setLoaded] = useState(false);
  const [signin, setSignin] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/notes?scope=trip", { cache: "no-store" });
    if (res.ok) setGroup(((await res.json()).group as Group) ?? null);
    setLoaded(true);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function unlock() {
    if (!code.trim()) return;
    setBusy(true);
    setErr(false);
    try {
      const res = await fetch("/api/notes/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        setCode("");
        setSignin(false);
        await load();
      } else setErr(true);
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await fetch("/api/notes/lock", { method: "POST" });
    await load();
  }

  if (!loaded) return null;

  const chip =
    "inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1 text-xs font-medium text-ink transition hover:border-accent";
  const chipAccent =
    "inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90";

  if (!group) {
    return signin ? (
      <div className="flex items-center gap-1.5">
        <input
          type="password"
          value={code}
          autoFocus
          onChange={(e) => {
            setCode(e.target.value);
            setErr(false);
          }}
          onKeyDown={(e) => e.key === "Enter" && unlock()}
          placeholder="Code"
          className={`w-24 rounded-full border bg-card px-3 py-1 text-xs outline-none ${
            err ? "border-accent" : "border-line"
          }`}
        />
        <button
          onClick={unlock}
          disabled={busy}
          className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-white disabled:opacity-60"
        >
          {busy ? "…" : "Go"}
        </button>
        <button onClick={() => setSignin(false)} className="px-1 text-xs text-faint">
          ✕
        </button>
      </div>
    ) : (
      <button onClick={() => setSignin(true)} className={chip}>
        <LogIn size={12} /> Sign in
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {group.owner && (
        <Link href="/people" className={chip}>
          <Users size={12} /> People
        </Link>
      )}
      <Link href="/edit" className={chip}>
        <Pencil size={12} /> Edit
      </Link>
      <Link href="/board" className={chipAccent}>
        <MessagesSquare size={15} /> Board
      </Link>
      <button
        onClick={signOut}
        aria-label="Sign out"
        className="text-faint transition hover:text-ink"
      >
        <LogOut size={14} />
      </button>
    </div>
  );
}

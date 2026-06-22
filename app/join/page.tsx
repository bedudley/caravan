"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, Copy, Check } from "lucide-react";
import CaravanMark from "@/components/CaravanMark";

type Done = { name: string; groupCode?: string };

export default function JoinPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"create" | "existing">("create");
  const [invite, setInvite] = useState("");
  const [name, setName] = useState("");
  const [groupCode, setGroupCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<Done | null>(null);
  const [copied, setCopied] = useState(false);

  function swap(to: "create" | "existing") {
    setMode(to);
    setErr("");
  }

  // First person in a couple: gate by the shared invite code, names the group.
  async function create() {
    if (!name.trim() || !invite.trim() || busy) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ joinCode: invite, name }),
      });
      const d = (await res.json().catch(() => ({}))) as {
        group?: { name?: string };
        passcode?: string;
        error?: string;
      };
      if (res.ok) setDone({ name: d.group?.name ?? name.trim(), groupCode: d.passcode });
      else
        setErr(
          res.status === 401
            ? "That invite code isn't right."
            : (d.error ?? "Something went wrong — try again."),
        );
    } finally {
      setBusy(false);
    }
  }

  // Second person: join a group a partner already made, using its group code.
  async function joinExisting() {
    if (!groupCode.trim() || busy) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/notes/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: groupCode }),
      });
      const d = (await res.json().catch(() => ({}))) as {
        group?: { name?: string };
      };
      if (res.ok) setDone({ name: d.group?.name ?? "your group" });
      else setErr("That group code isn't right.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    const link =
      typeof window !== "undefined" ? `${window.location.origin}/join` : "/join";
    const partnerMsg = done.groupCode
      ? `Join our trip space: ${link} — tap "I have a group code" and enter ${done.groupCode}`
      : "";
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
        <div className="rounded-card border border-line bg-card p-6 text-center">
          <div className="text-4xl">🎉</div>
          <h1 className="mt-2 font-display text-3xl text-wine">You&apos;re in!</h1>
          <p className="mt-2 text-sm text-muted">
            Welcome, <span className="font-medium text-ink">{done.name}</span>. Your
            private notes are ready.
          </p>

          {done.groupCode && (
            <div className="mt-5 rounded-lg border border-line bg-paper p-4 text-left">
              <p className="text-xs font-medium uppercase tracking-wide text-faint">
                Your group code
              </p>
              <p className="mt-1 text-xs text-muted">
                Share it with your partner so they join this same space — and keep it
                to log in on another device.
              </p>
              <div className="mt-2 flex items-center gap-2">
                <code className="rounded bg-card px-2 py-1 font-mono text-accent">
                  {done.groupCode}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(partnerMsg);
                    setCopied(true);
                  }}
                  className="flex items-center gap-1 text-xs text-muted transition hover:text-ink"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? "Copied invite" : "Copy invite for partner"}
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => router.push("/")}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 font-medium text-white"
          >
            Go to the trip <ArrowRight size={16} />
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="rounded-card border border-line bg-card p-6">
        <div className="mb-4">
          <CaravanMark />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-faint">
          Paris Phase Trip
        </p>
        <h1 className="mt-1 font-display text-3xl text-wine">Join the trip</h1>

        {mode === "create" ? (
          <>
            <p className="mt-2 text-sm text-muted">
              Enter the invite code from the group chat and your name. You&apos;ll get
              your own private space for notes &amp; photos.
            </p>

            <label className="mt-5 block text-xs font-medium uppercase tracking-wide text-faint">
              Invite code
            </label>
            <input
              value={invite}
              onChange={(e) => {
                setInvite(e.target.value);
                setErr("");
              }}
              placeholder="e.g. provence26"
              autoCapitalize="off"
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-accent"
            />

            <label className="mt-4 block text-xs font-medium uppercase tracking-wide text-faint">
              Your name / group
            </label>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErr("");
              }}
              onKeyDown={(e) => e.key === "Enter" && create()}
              placeholder="e.g. Marcus & Tay"
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-accent"
            />

            {err && <p className="mt-3 text-sm text-accent">{err}</p>}

            <button
              onClick={create}
              disabled={busy || !name.trim() || !invite.trim()}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 font-medium text-white disabled:opacity-60"
            >
              {busy ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Join the trip <ArrowRight size={16} />
                </>
              )}
            </button>

            <p className="mt-4 text-center text-sm text-muted">
              Partner already started your group?{" "}
              <button
                onClick={() => swap("existing")}
                className="font-medium text-accent underline-offset-2 hover:underline"
              >
                I have a group code
              </button>
            </p>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted">
              Joining a partner who already set up your group? Enter the group code
              they shared and you&apos;ll land in the same space.
            </p>

            <label className="mt-5 block text-xs font-medium uppercase tracking-wide text-faint">
              Group code
            </label>
            <input
              value={groupCode}
              onChange={(e) => {
                setGroupCode(e.target.value);
                setErr("");
              }}
              onKeyDown={(e) => e.key === "Enter" && joinExisting()}
              placeholder="the code your partner sent"
              autoCapitalize="off"
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-accent"
            />

            {err && <p className="mt-3 text-sm text-accent">{err}</p>}

            <button
              onClick={joinExisting}
              disabled={busy || !groupCode.trim()}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 font-medium text-white disabled:opacity-60"
            >
              {busy ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Join your group <ArrowRight size={16} />
                </>
              )}
            </button>

            <p className="mt-4 text-center text-sm text-muted">
              <button
                onClick={() => swap("create")}
                className="font-medium text-accent underline-offset-2 hover:underline"
              >
                ← Start a new group instead
              </button>
            </p>
          </>
        )}
      </div>
    </main>
  );
}

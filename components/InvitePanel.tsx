"use client";

import { useCallback, useEffect, useState } from "react";
import { Link2, Check, Copy, RefreshCw } from "lucide-react";

// Owner-only: the shared invite code + the link to share for self-serve joining.
export default function InvitePanel() {
  const [code, setCode] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/notes/joincode", { cache: "no-store" });
    if (res.ok) {
      setCode(((await res.json()) as { joinCode: string | null }).joinCode);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function save(custom: boolean) {
    setSaving(true);
    try {
      const res = await fetch("/api/notes/joincode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(custom ? { code: draft.trim() } : {}),
      });
      if (res.ok) {
        setCode(((await res.json()) as { joinCode: string }).joinCode);
        setEditing(false);
        setDraft("");
        setCopied(false);
      }
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return null;

  const link =
    typeof window !== "undefined" ? `${window.location.origin}/join` : "/join";
  const shareText = code ? `Join our trip: ${link} — invite code: ${code}` : "";

  return (
    <div className="rounded-card border border-line bg-card p-4">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-faint">
        <Link2 size={12} /> Invite others
      </div>

      {code ? (
        <>
          <p className="mt-1.5 text-sm text-ink">
            Share the link &amp; code so others join with their own private space.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted">Code:</span>
            <code className="rounded bg-paper px-2 py-1 font-mono text-accent">
              {code}
            </code>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(shareText);
                setCopied(true);
              }}
              className="flex items-center gap-1 text-xs text-muted transition hover:text-ink"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? "Copied link + code" : "Copy link + code"}
            </button>
          </div>
        </>
      ) : (
        <p className="mt-1.5 text-sm text-muted">
          No invite code yet — set one to open self-serve joining.
        </p>
      )}

      {editing ? (
        <div className="mt-2 flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && draft.trim() && save(true)}
            placeholder="e.g. provence26"
            autoCapitalize="off"
            className="min-w-0 flex-1 rounded-full border border-line bg-paper px-3 py-1.5 text-sm outline-none focus:border-accent"
          />
          <button
            onClick={() => save(true)}
            disabled={saving || !draft.trim()}
            className="shrink-0 rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? "…" : "Set"}
          </button>
          <button onClick={() => setEditing(false)} className="shrink-0 text-xs text-faint">
            cancel
          </button>
        </div>
      ) : (
        <div className="mt-2 flex items-center gap-3 text-xs">
          <button
            onClick={() => {
              setEditing(true);
              setDraft(code ?? "");
            }}
            className="text-muted transition hover:text-ink"
          >
            {code ? "Change code" : "Set invite code"}
          </button>
          {code && (
            <button
              onClick={() => save(false)}
              disabled={saving}
              className="flex items-center gap-1 text-muted transition hover:text-ink disabled:opacity-60"
            >
              <RefreshCw size={12} /> Rotate
            </button>
          )}
        </div>
      )}
    </div>
  );
}

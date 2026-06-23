"use client";

import { useState } from "react";
import { UserPlus, Check, Copy } from "lucide-react";

// Owner-only: create a new group and reveal its one-time passcode to share.
export default function AddGroup() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<{ name: string; passcode: string } | null>(
    null,
  );
  const [copied, setCopied] = useState(false);

  async function create() {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/notes/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.ok) {
        const d = (await res.json()) as {
          group: { name: string };
          passcode: string;
        };
        setCreated({ name: d.group.name, passcode: d.passcode });
        setName("");
      }
    } finally {
      setCreating(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => {
          setOpen(true);
          setCreated(null);
        }}
        className="flex items-center gap-1.5 text-sm font-medium text-accent transition hover:opacity-80"
      >
        <UserPlus size={14} /> Add a group
      </button>
    );
  }

  return (
    <div className="rounded-card border border-line bg-card p-4">
      <div className="flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && create()}
          placeholder="Group name (e.g. The Coworkers)"
          className="min-w-0 flex-1 rounded-full border border-line bg-paper px-3 py-1.5 text-sm outline-none focus:border-accent"
        />
        <button
          onClick={create}
          disabled={creating || !name.trim()}
          className="shrink-0 rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {creating ? "…" : "Create"}
        </button>
        <button onClick={() => setOpen(false)} className="shrink-0 text-xs text-faint">
          close
        </button>
      </div>
      {created && (
        <div className="mt-3 rounded-lg border border-line bg-paper p-3 text-sm">
          <div className="text-ink">
            <span className="font-medium">{created.name}</span> can unlock with:
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <code className="rounded bg-card px-2 py-1 font-mono text-accent">
              {created.passcode}
            </code>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(created.passcode);
                setCopied(true);
              }}
              className="flex items-center gap-1 text-xs text-muted transition hover:text-ink"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="mt-1.5 text-xs text-faint">
            Share this with them — it won&apos;t be shown again.
          </div>
        </div>
      )}
    </div>
  );
}

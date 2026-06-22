"use client";

import { useEffect, useState } from "react";
import { Pencil, Check, X, Loader2 } from "lucide-react";

// The vacation title. Everyone sees it (server-rendered initial value); the
// owner gets an inline pencil to rename it. Kept client-side so the home page
// stays statically cached for no-code visitors.
export default function EditableTripTitle({ initial }: { initial: string }) {
  const [title, setTitle] = useState(initial);
  const [owner, setOwner] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initial);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/notes?scope=trip", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d?.group?.owner) setOwner(true);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  async function save() {
    const t = draft.trim();
    if (!t || t === title) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: t }),
      });
      if (res.ok) {
        setTitle(t);
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") {
              setEditing(false);
              setDraft(title);
            }
          }}
          autoFocus
          maxLength={80}
          className="min-w-0 flex-1 rounded-lg border border-line bg-card px-2 py-1 font-display text-2xl text-wine outline-none focus:border-accent sm:text-3xl"
        />
        <button
          onClick={save}
          disabled={saving}
          aria-label="Save title"
          className="shrink-0 text-accent"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={20} />}
        </button>
        <button
          onClick={() => {
            setEditing(false);
            setDraft(title);
          }}
          aria-label="Cancel"
          className="shrink-0 text-faint"
        >
          <X size={18} />
        </button>
      </div>
    );
  }

  return (
    <h1 className="font-display text-2xl text-wine sm:text-3xl">
      {title}
      {owner && (
        <button
          onClick={() => {
            setDraft(title);
            setEditing(true);
          }}
          aria-label="Edit vacation title"
          className="ml-2 align-middle text-faint transition hover:text-accent"
        >
          <Pencil size={15} />
        </button>
      )}
    </h1>
  );
}

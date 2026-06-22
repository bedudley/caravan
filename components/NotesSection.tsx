"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Globe,
  Lock,
  Pencil,
  ImagePlus,
  Check,
  Loader2,
  Plus,
  UserPlus,
  Copy,
  Link2,
  RefreshCw,
} from "lucide-react";
import PhotoGrid from "./PhotoGrid";
import { prepUpload } from "@/lib/prepUpload";

type Note = { text: string; images: string[]; updatedAt: number };
type Group = { id: string; name: string; owner: boolean };
type Data = { public: Note | null; private: Note | null; group: Group | null };
type Visibility = "public" | "private";

export default function NotesSection({ scope }: { scope: string }) {
  const [data, setData] = useState<Data | null>(null);
  const [showUnlock, setShowUnlock] = useState(false);
  const [code, setCode] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [unlockErr, setUnlockErr] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/notes?scope=${encodeURIComponent(scope)}`, {
      cache: "no-store",
    });
    if (res.ok) setData((await res.json()) as Data);
  }, [scope]);

  useEffect(() => {
    // fetch-on-mount; setData runs after the await, not synchronously
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function unlock() {
    setUnlocking(true);
    setUnlockErr(false);
    try {
      const res = await fetch("/api/notes/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        setShowUnlock(false);
        setCode("");
        await load();
      } else {
        setUnlockErr(true);
      }
    } finally {
      setUnlocking(false);
    }
  }

  async function lock() {
    await fetch("/api/notes/lock", { method: "POST" });
    await load();
  }

  if (!data) return null; // still loading

  const group = data.group;
  const unlocked = !!group;
  const isOwner = !!group?.owner;
  const hasPublic = !!(data.public?.text || data.public?.images.length);

  // A visitor with nothing to see → just a quiet way in (so owners can unlock).
  if (!unlocked && !hasPublic && !showUnlock) {
    return (
      <div className="mt-6 px-1">
        <button
          onClick={() => setShowUnlock(true)}
          className="flex items-center gap-1.5 text-xs text-faint transition hover:text-muted"
        >
          <Lock size={12} /> Notes
        </button>
      </div>
    );
  }

  const privateLabel = isOwner ? "Just us" : (group?.name ?? "Just us");

  return (
    <section className="mt-7">
      <h3 className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.16em] text-faint">
        Notes
      </h3>

      <div className="flex flex-col gap-3">
        <NoteBlock
          key={`public-${data.public?.updatedAt ?? 0}`}
          scope={scope}
          visibility="public"
          label="Shared"
          note={data.public}
          canEdit={isOwner}
          onSaved={load}
        />
        {unlocked && (
          <NoteBlock
            key={`private-${group?.id}-${data.private?.updatedAt ?? 0}`}
            scope={scope}
            visibility="private"
            label={privateLabel}
            note={data.private}
            canEdit
            onSaved={load}
          />
        )}
      </div>

      <div className="mt-3 px-1">
        {unlocked ? (
          <div className="flex flex-col gap-3">
            {/* Owner group-admin lives only on the trip page, not every day */}
            {isOwner && scope === "trip" && (
              <>
                <InvitePanel />
                <AddGroup />
              </>
            )}
            <button
              onClick={lock}
              className="self-start text-xs text-faint transition hover:text-muted"
            >
              {isOwner ? "Done editing — lock" : `Unlocked as ${group?.name} — lock`}
            </button>
          </div>
        ) : showUnlock ? (
          <div className="flex items-center gap-2">
            <input
              type="password"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setUnlockErr(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && unlock()}
              placeholder="Passcode"
              autoFocus
              className={`w-32 rounded-full border bg-card px-3 py-1 text-sm ${
                unlockErr ? "border-accent" : "border-line"
              }`}
            />
            <button
              onClick={unlock}
              disabled={unlocking}
              className="rounded-full bg-accent px-3 py-1 text-sm font-medium text-white disabled:opacity-60"
            >
              {unlocking ? "…" : "Unlock"}
            </button>
            <button onClick={() => setShowUnlock(false)} className="text-xs text-faint">
              cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowUnlock(true)}
            className="flex items-center gap-1.5 text-xs text-faint transition hover:text-muted"
          >
            <Lock size={12} /> Unlock to add notes &amp; photos
          </button>
        )}
      </div>
    </section>
  );
}

/** Owner-only: the shared invite code + the link to share for self-serve joining. */
function InvitePanel() {
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
    <div className="rounded-card border border-line bg-card p-3">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-faint">
        <Link2 size={12} /> Invite others
      </div>

      {code ? (
        <>
          <p className="mt-1.5 text-sm text-ink">
            Share the link &amp; code so others join with their own private notes.
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
          <button
            onClick={() => setEditing(false)}
            className="shrink-0 text-xs text-faint"
          >
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

/** Owner-only: create a new group and reveal its one-time passcode to share. */
function AddGroup() {
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
        className="flex items-center gap-1.5 text-xs text-muted transition hover:text-ink"
      >
        <UserPlus size={13} /> Add a group
      </button>
    );
  }

  return (
    <div className="rounded-card border border-line bg-card p-3">
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

function NoteBlock({
  scope,
  visibility,
  label,
  note,
  canEdit,
  onSaved,
}: {
  scope: string;
  visibility: Visibility;
  label: string;
  note: Note | null;
  canEdit: boolean;
  onSaved: () => void;
}) {
  const isPrivate = visibility === "private";
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(note?.text ?? "");
  const [images, setImages] = useState<string[]>(note?.images ?? []);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const hasContent = !!(note?.text || note?.images.length);
  if (!canEdit && !hasContent) return null;

  async function addPhotos(files: FileList) {
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const prepped = await prepUpload(file);
        const fd = new FormData();
        fd.append("file", prepped);
        const res = await fetch("/api/notes/upload", { method: "POST", body: fd });
        if (res.ok) {
          const { url } = (await res.json()) as { url: string };
          setImages((prev) => [...prev, url]);
        }
      }
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    try {
      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope, visibility, text, images }),
      });
      setEditing(false);
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="rounded-card border bg-card p-4"
      style={
        isPrivate
          ? { borderColor: "var(--color-accent)", borderStyle: "dashed" }
          : { borderColor: "var(--color-line)" }
      }
    >
      <div className="mb-1.5 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-faint">
          {isPrivate ? <Lock size={12} /> : <Globe size={12} />} {label}
        </span>
        {canEdit && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 text-xs text-muted transition hover:text-ink"
          >
            <Pencil size={12} /> Edit
          </button>
        )}
      </div>

      {editing ? (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder={
              isPrivate
                ? "Private notes for your group…"
                : "Something for everyone following along…"
            }
            className="w-full resize-y rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          />
          <PhotoGrid
            images={images}
            onRemove={(url) => setImages((p) => p.filter((u) => u !== url))}
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => e.target.files && addPhotos(e.target.files)}
          />
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-sm text-ink disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ImagePlus size={14} />
              )}
              {uploading ? "Uploading…" : "Add photos"}
            </button>
            <div className="flex-1" />
            <button
              onClick={() => setEditing(false)}
              className="px-2 text-sm text-faint"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
            >
              <Check size={14} /> {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </>
      ) : hasContent ? (
        <>
          {note?.text && (
            <p className="whitespace-pre-wrap text-sm text-ink">{note.text}</p>
          )}
          <PhotoGrid images={note?.images ?? []} />
        </>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 text-sm text-muted transition hover:text-ink"
        >
          <Plus size={14} /> Add {isPrivate ? "a private" : "a public"} note
        </button>
      )}
    </div>
  );
}

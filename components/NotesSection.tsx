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
} from "lucide-react";
import PhotoGrid from "./PhotoGrid";

type Note = { text: string; images: string[]; updatedAt: number };
type Data = { public: Note | null; private: Note | null; canEdit: boolean };
type Visibility = "public" | "private";

/** Downscale a chosen photo client-side so uploads stay small. Falls back to
 *  the original file if the browser can't decode it (e.g. some HEIC). */
async function prepUpload(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const max = 1600;
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob((b) => res(b), "image/jpeg", 0.85),
    );
    if (blob) return new File([blob], "photo.jpg", { type: "image/jpeg" });
  } catch {
    /* fall through */
  }
  return file;
}

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

  if (!data) return null; // still loading → nothing yet

  const hasPublic = !!(data.public?.text || data.public?.images.length);
  // Hide entirely for a visitor with nothing to see (keeps parents' view clean).
  if (!data.canEdit && !hasPublic && !showUnlock) {
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
          note={data.public}
          canEdit={data.canEdit}
          onSaved={load}
        />
        {data.canEdit && (
          <NoteBlock
            key={`private-${data.private?.updatedAt ?? 0}`}
            scope={scope}
            visibility="private"
            note={data.private}
            canEdit
            onSaved={load}
          />
        )}
      </div>

      {/* owner controls */}
      <div className="mt-3 px-1">
        {data.canEdit ? (
          <button
            onClick={lock}
            className="text-xs text-faint transition hover:text-muted"
          >
            Done editing — lock
          </button>
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
            <button
              onClick={() => setShowUnlock(false)}
              className="text-xs text-faint"
            >
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

function NoteBlock({
  scope,
  visibility,
  note,
  canEdit,
  onSaved,
}: {
  scope: string;
  visibility: Visibility;
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
        const res = await fetch("/api/notes/upload", {
          method: "POST",
          body: fd,
        });
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

  const label = isPrivate ? "Just us" : "Shared";

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
                ? "Notes just for you two…"
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

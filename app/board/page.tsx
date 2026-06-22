"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  RefreshCw,
  Trash2,
  Loader2,
  Lock,
  ImagePlus,
} from "lucide-react";
import PhotoGrid from "@/components/PhotoGrid";
import { prepUpload } from "@/lib/prepUpload";

type Post = {
  id: string;
  groupId: string;
  author: string;
  text: string;
  image?: string;
  ts: number;
};
type Me = { id: string; owner: boolean };

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 45) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function BoardPage() {
  const [status, setStatus] = useState<"loading" | "gated" | "ready">("loading");
  const [posts, setPosts] = useState<Post[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [gateErr, setGateErr] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/board", { cache: "no-store" });
    if (res.status === 401) {
      setStatus("gated");
      return;
    }
    if (res.ok) {
      const d = (await res.json()) as { posts: Post[]; me: Me };
      setPosts(d.posts);
      setMe(d.me);
      setStatus("ready");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  async function addPhoto(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", await prepUpload(file));
      const res = await fetch("/api/notes/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = (await res.json()) as { url: string };
        setImage(url);
      }
    } finally {
      setUploading(false);
    }
  }

  async function post() {
    if ((!text.trim() && !image) || posting) return;
    setPosting(true);
    try {
      const res = await fetch("/api/board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, image }),
      });
      if (res.ok) {
        setText("");
        setImage(null);
        await load();
      }
    } finally {
      setPosting(false);
    }
  }

  async function remove(id: string) {
    await fetch(`/api/board?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    await load();
  }

  async function unlock() {
    if (!code.trim()) return;
    setUnlocking(true);
    setGateErr(false);
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
        setGateErr(true);
      }
    } finally {
      setUnlocking(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-md px-5 py-8">
      <Link
        href="/"
        className="flex items-center gap-1.5 text-sm text-muted transition hover:text-ink"
      >
        <ArrowLeft size={15} /> Trip
      </Link>

      <div className="mt-3 flex items-baseline justify-between">
        <h1 className="font-display text-3xl text-wine">The Board</h1>
        {status === "ready" && (
          <button
            onClick={load}
            className="flex items-center gap-1 text-xs text-faint transition hover:text-muted"
          >
            <RefreshCw size={12} /> Refresh
          </button>
        )}
      </div>
      <p className="mt-1 text-sm text-muted">
        Quick notes for everyone on the trip — who&apos;s where, plans, run-ins.
      </p>

      {status === "gated" && (
        <div className="mt-6 rounded-card border border-line bg-card p-5">
          <div className="flex items-center gap-1.5 text-sm font-medium text-ink">
            <Lock size={14} /> Travelers only
          </div>
          <p className="mt-1 text-sm text-muted">
            Enter your group code to see and post to the board.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <input
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setGateErr(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && unlock()}
              placeholder="Group code"
              autoCapitalize="off"
              className={`min-w-0 flex-1 rounded-full border bg-paper px-3 py-2 text-sm outline-none focus:border-accent ${
                gateErr ? "border-accent" : "border-line"
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

      {status === "ready" && (
        <>
          <div className="mt-5 rounded-card border border-line bg-card p-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
              placeholder="Share something with the group…"
              className="w-full resize-none rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
            {image && (
              <PhotoGrid images={[image]} onRemove={() => setImage(null)} />
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => e.target.files?.[0] && addPhoto(e.target.files[0])}
            />
            <div className="mt-2 flex items-center justify-between">
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
                Photo
              </button>
              <button
                onClick={post}
                disabled={posting || (!text.trim() && !image)}
                className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-white disabled:opacity-60"
              >
                {posting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                Post
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            {posts.length === 0 && (
              <p className="py-8 text-center text-sm text-faint">
                No posts yet — say hi 👋
              </p>
            )}
            {posts.map((p) => {
              const mine = !!me && (p.groupId === me.id || me.owner);
              return (
                <div key={p.id} className="rounded-card border border-line bg-card p-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold text-wine">{p.author}</span>
                    <span className="shrink-0 text-xs text-faint">{timeAgo(p.ts)}</span>
                  </div>
                  {p.text && (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-ink">
                      {p.text}
                    </p>
                  )}
                  {p.image && <PhotoGrid images={[p.image]} />}
                  {mine && (
                    <button
                      onClick={() => remove(p.id)}
                      className="mt-2 flex items-center gap-1 text-xs text-faint transition hover:text-accent"
                    >
                      <Trash2 size={11} /> Delete
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}

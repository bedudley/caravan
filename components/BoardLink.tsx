"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessagesSquare } from "lucide-react";

// Only surfaces the Board entry point to unlocked travelers, so no-code visitors
// (parents) never see a link they can't use.
export default function BoardLink() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/notes?scope=trip", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d?.group) setShow(true);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (!show) return null;

  return (
    <Link
      href="/board"
      className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
    >
      <MessagesSquare size={15} /> Board
    </Link>
  );
}

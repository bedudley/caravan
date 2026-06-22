"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";

// Shows an "Edit" link to /edit only for unlocked travelers (any group).
export default function EditLink() {
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
      href="/edit"
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1 text-xs font-medium text-ink transition hover:border-accent"
    >
      <Pencil size={12} /> Edit
    </Link>
  );
}

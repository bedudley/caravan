import { NextRequest, NextResponse } from "next/server";
import { getNote, setNote, type Visibility } from "@/lib/notes";
import { currentGroup } from "@/lib/groups";

export const dynamic = "force-dynamic"; // cookie-dependent

function validScope(s: string | null): s is string {
  return !!s && (s === "trip" || /^day:[a-z0-9-]+$/i.test(s));
}

// Public note: always returned. Private note: ONLY the current group's own — a
// visitor (or another group) never receives it.
export async function GET(req: NextRequest) {
  const scope = req.nextUrl.searchParams.get("scope");
  if (!validScope(scope)) {
    return NextResponse.json({ error: "bad scope" }, { status: 400 });
  }
  const group = await currentGroup();
  const publicNote = await getNote("public", scope);
  const privateNote = group ? await getNote("private", scope, group.id) : null;
  return NextResponse.json(
    {
      public: publicNote,
      private: privateNote,
      group: group ? { id: group.id, name: group.name, owner: group.owner } : null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(req: NextRequest) {
  const group = await currentGroup();
  if (!group) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as {
    scope?: string;
    visibility?: string;
    text?: string;
    images?: unknown;
  } | null;

  if (
    !body ||
    !validScope(body.scope ?? null) ||
    (body.visibility !== "public" && body.visibility !== "private")
  ) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  // Only the owner group may edit PUBLIC notes.
  if (body.visibility === "public" && !group.owner) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const text = typeof body.text === "string" ? body.text.slice(0, 5000) : "";
  const images = Array.isArray(body.images)
    ? body.images.filter((x): x is string => typeof x === "string").slice(0, 30)
    : [];

  await setNote(
    body.visibility as Visibility,
    body.scope as string,
    { text, images, updatedAt: Date.now() },
    group.id,
  );
  return NextResponse.json({ ok: true });
}

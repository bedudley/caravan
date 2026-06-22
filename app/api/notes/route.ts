import { NextRequest, NextResponse } from "next/server";
import { getNote, setNote, type Visibility } from "@/lib/notes";
import { isOwner } from "@/lib/owner";

export const dynamic = "force-dynamic"; // cookie-dependent

function validScope(s: string | null): s is string {
  return !!s && (s === "trip" || /^day:[a-z0-9-]+$/i.test(s));
}

// Returns the public note always; the private note ONLY for a verified owner.
export async function GET(req: NextRequest) {
  const scope = req.nextUrl.searchParams.get("scope");
  if (!validScope(scope)) {
    return NextResponse.json({ error: "bad scope" }, { status: 400 });
  }
  const owner = await isOwner();
  const publicNote = await getNote("public", scope);
  const privateNote = owner ? await getNote("private", scope) : null;
  return NextResponse.json(
    { public: publicNote, private: privateNote, canEdit: owner },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(req: NextRequest) {
  if (!(await isOwner())) {
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

  const text = typeof body.text === "string" ? body.text.slice(0, 5000) : "";
  const images = Array.isArray(body.images)
    ? body.images.filter((x): x is string => typeof x === "string").slice(0, 30)
    : [];

  await setNote(body.visibility as Visibility, body.scope as string, {
    text,
    images,
    updatedAt: Date.now(),
  });
  return NextResponse.json({ ok: true });
}

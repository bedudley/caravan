import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { currentGroup } from "@/lib/groups";
import { getCore, getOverlay, setCore, setOverlay } from "@/lib/itinerary";

export const dynamic = "force-dynamic";

// GET: the shared core + the caller's own overlay (no-cookie → owner's view).
export async function GET() {
  const group = await currentGroup();
  const gid = group?.id ?? "owner";
  const [core, overlay] = await Promise.all([getCore(), getOverlay(gid)]);
  return NextResponse.json(
    {
      core,
      overlay,
      group: group ? { id: group.id, name: group.name, owner: group.owner } : null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

// POST { scope: "core", stops }  → owner-only, sets the shared core.
// POST { scope: "overlay", overlay } → any group, sets only its own overlay.
export async function POST(req: NextRequest) {
  const group = await currentGroup();
  if (!group) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as {
    scope?: string;
    stops?: unknown;
    overlay?: unknown;
  } | null;

  if (body?.scope === "core") {
    if (!group.owner) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    const saved = await setCore(body.stops);
    if (!saved) {
      return NextResponse.json({ error: "need at least one valid stop" }, { status: 400 });
    }
    revalidatePath("/");
    return NextResponse.json({ core: saved });
  }

  if (body?.scope === "overlay") {
    const saved = await setOverlay(group.id, body.overlay);
    revalidatePath("/");
    return NextResponse.json({ overlay: saved });
  }

  return NextResponse.json({ error: "bad scope" }, { status: 400 });
}

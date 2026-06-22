import { NextRequest, NextResponse } from "next/server";
import { currentGroup } from "@/lib/groups";
import { geocode } from "@/lib/geocode";

export const dynamic = "force-dynamic";

// Group-gated so it isn't an open geocoding proxy; keeps the 3rd-party call server-side.
export async function GET(req: NextRequest) {
  const group = await currentGroup();
  if (!group) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const q = req.nextUrl.searchParams.get("q") ?? "";
  return NextResponse.json(
    { results: await geocode(q) },
    { headers: { "Cache-Control": "no-store" } },
  );
}

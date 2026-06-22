import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { currentGroup } from "@/lib/groups";
import { getTripTitle, setTripTitle } from "@/lib/trip-meta";

export const dynamic = "force-dynamic";

// Public read (everyone sees the title); owner-only write.
export async function GET() {
  return NextResponse.json({ title: await getTripTitle() });
}

export async function POST(req: Request) {
  const group = await currentGroup();
  if (!group?.owner) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = (await req.json().catch(() => null)) as { title?: string } | null;
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }
  const saved = await setTripTitle(title);
  revalidatePath("/"); // refresh the cached home page so everyone sees it
  return NextResponse.json({ title: saved });
}

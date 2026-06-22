import { NextRequest, NextResponse } from "next/server";
import { currentGroup } from "@/lib/groups";
import { getPosts, addPost, deletePost } from "@/lib/board";

export const dynamic = "force-dynamic";

// The board is travelers-only: every verb requires an unlocked group. No-code
// visitors (parents) get 401 and never see the feed.
export async function GET() {
  const group = await currentGroup();
  if (!group) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json(
    { posts: await getPosts(), me: { id: group.id, owner: group.owner } },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(req: NextRequest) {
  const group = await currentGroup();
  if (!group) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as { text?: string } | null;
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "empty" }, { status: 400 });
  }
  const post = await addPost(group.id, group.name, text);
  return NextResponse.json({ post });
}

export async function DELETE(req: NextRequest) {
  const group = await currentGroup();
  if (!group) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "no id" }, { status: 400 });
  }
  const ok = await deletePost(id, group.id, group.owner);
  return NextResponse.json({ ok }, { status: ok ? 200 : 403 });
}

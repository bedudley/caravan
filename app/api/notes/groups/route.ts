import { NextResponse } from "next/server";
import { currentGroup, createGroup, listGroups } from "@/lib/groups";

export const dynamic = "force-dynamic";

// Owner-only: list and create groups. Creating returns the new passcode ONCE for
// the owner to share with that group.
export async function GET() {
  const group = await currentGroup();
  if (!group?.owner) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return NextResponse.json({ groups: await listGroups() });
}

export async function POST(req: Request) {
  const group = await currentGroup();
  if (!group?.owner) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = (await req.json().catch(() => null)) as { name?: string } | null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }
  const { group: created, passcode } = await createGroup(name);
  return NextResponse.json({ group: created, passcode });
}

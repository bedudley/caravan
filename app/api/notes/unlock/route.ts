import { NextResponse } from "next/server";
import { groupForCode, setGroupCookie } from "@/lib/groups";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { code?: string } | null;
  if (!body || typeof body.code !== "string") {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const group = await groupForCode(body.code);
  if (!group) {
    return NextResponse.json({ error: "wrong code" }, { status: 401 });
  }
  await setGroupCookie(group.id);
  return NextResponse.json({ ok: true, group: { name: group.name, owner: group.owner } });
}

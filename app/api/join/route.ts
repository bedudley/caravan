import { NextResponse } from "next/server";
import { joinCodeValid, createGroup, setGroupCookie } from "@/lib/groups";

export const dynamic = "force-dynamic";

// Public self-serve join, gated by the shared invite code. The invite code only
// authorizes creating YOUR OWN group — it never exposes anyone else's notes.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    joinCode?: string;
    name?: string;
  } | null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const code = typeof body?.joinCode === "string" ? body.joinCode : "";
  if (!name) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }
  if (!(await joinCodeValid(code))) {
    return NextResponse.json({ error: "invalid invite code" }, { status: 401 });
  }
  const { group, passcode } = await createGroup(name);
  await setGroupCookie(group.id);
  return NextResponse.json({ ok: true, group: { name: group.name }, passcode });
}

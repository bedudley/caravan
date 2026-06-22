import { NextResponse } from "next/server";
import {
  currentGroup,
  getJoinCode,
  setJoinCode,
  generateJoinCode,
} from "@/lib/groups";

export const dynamic = "force-dynamic";

// Owner-only: read, set, or rotate the shared invite code. POST with no body
// generates a fresh one; POST { code } sets a custom (memorable) one.
export async function GET() {
  const group = await currentGroup();
  if (!group?.owner) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return NextResponse.json({ joinCode: await getJoinCode() });
}

export async function POST(req: Request) {
  const group = await currentGroup();
  if (!group?.owner) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = (await req.json().catch(() => null)) as { code?: string } | null;
  const requested = typeof body?.code === "string" ? body.code.trim() : "";
  const code = await setJoinCode(requested || generateJoinCode());
  return NextResponse.json({ joinCode: code });
}

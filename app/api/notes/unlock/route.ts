import { NextResponse } from "next/server";
import { checkCode, setOwnerCookie } from "@/lib/owner";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { code?: string } | null;
  if (!body || typeof body.code !== "string" || !checkCode(body.code)) {
    return NextResponse.json({ error: "wrong code" }, { status: 401 });
  }
  await setOwnerCookie();
  return NextResponse.json({ ok: true });
}

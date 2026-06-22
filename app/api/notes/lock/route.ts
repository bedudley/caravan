import { NextResponse } from "next/server";
import { clearGroupCookie } from "@/lib/groups";

export const dynamic = "force-dynamic";

export async function POST() {
  await clearGroupCookie();
  return NextResponse.json({ ok: true });
}

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

// "Owner" = Brendan or Sha'Meaka — proven by knowing NOTES_CODE. The cookie
// stores an HMAC of the code (not the raw code), so it can't be reused to learn
// the passcode. No NOTES_CODE configured → nobody is an owner (safe default).

const COOKIE = "vac_owner";

function ownerToken(): string {
  const code = process.env.NOTES_CODE ?? "";
  return createHmac("sha256", code || "no-code").update("owner").digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** True if the supplied passcode matches NOTES_CODE. */
export function checkCode(code: string): boolean {
  const expected = process.env.NOTES_CODE ?? "";
  if (!expected) return false;
  return safeEqual(code, expected);
}

/** True if the current request carries a valid owner cookie. */
export async function isOwner(): Promise<boolean> {
  if (!process.env.NOTES_CODE) return false;
  const jar = await cookies();
  const value = jar.get(COOKIE)?.value;
  return !!value && safeEqual(value, ownerToken());
}

export async function setOwnerCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, ownerToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function clearOwnerCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

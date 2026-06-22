import { createHmac, timingSafeEqual, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { kvGet, kvSet } from "./store";

// A "group" = a couple/party traveling together. Identity is proven by a
// passcode. The OWNER group (Brendan & Sha'Meaka) is bootstrapped from env and
// is the only one that can edit PUBLIC notes; every group has its own isolated
// PRIVATE notes. Generic for N groups: non-owner groups live in the KV registry
// and can be added in-app by the owner (no redeploy).

const COOKIE = "vac_group";
const OWNER_ID = "owner";
const REGISTRY_KEY = "groups";
const JOINCODE_KEY = "joinCode";

export type Group = { id: string; name: string; owner: boolean };
type StoredGroup = { id: string; name: string; passcodeHash: string };

function secret(): string {
  return process.env.NOTES_SECRET ?? "dev-insecure-secret";
}
function hmac(input: string): string {
  return createHmac("sha256", secret()).update(input).digest("hex");
}
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}
function ownerName(): string {
  return process.env.OWNER_NAME ?? "Brendan & Sha'Meaka";
}

async function registry(): Promise<StoredGroup[]> {
  return (await kvGet<StoredGroup[]>(REGISTRY_KEY)) ?? [];
}

export async function listGroups(): Promise<Group[]> {
  return (await registry()).map((g) => ({ id: g.id, name: g.name, owner: false }));
}

export async function createGroup(
  name: string,
): Promise<{ group: Group; passcode: string }> {
  const reg = await registry();
  const id = "g_" + randomBytes(4).toString("hex");
  const passcode = randomBytes(4).toString("hex"); // 8-char code to share
  const clean = name.trim().slice(0, 60) || "Group";
  reg.push({ id, name: clean, passcodeHash: hmac("code:" + passcode) });
  await kvSet(REGISTRY_KEY, reg);
  return { group: { id, name: clean, owner: false }, passcode };
}

// ── Shared invite code (self-serve join) ─────────────────────────────────────
// One low-stakes code the owner shares. It only authorizes creating YOUR OWN
// group; it never unlocks anyone else's notes. Stored plaintext so the owner can
// see/share it; rotating it just cuts off new signups.
export async function getJoinCode(): Promise<string | null> {
  const c = await kvGet<string>(JOINCODE_KEY);
  return c && c.length ? c : null;
}

export async function setJoinCode(code: string): Promise<string> {
  const clean = code.trim().slice(0, 40);
  await kvSet(JOINCODE_KEY, clean);
  return clean;
}

export function generateJoinCode(): string {
  return randomBytes(4).toString("hex");
}

export async function joinCodeValid(code: string): Promise<boolean> {
  const stored = await getJoinCode();
  if (!stored) return false;
  const a = Buffer.from(code.trim());
  const b = Buffer.from(stored);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Resolve a passcode to its group (owner or a registry group), or null. */
export async function groupForCode(code: string): Promise<Group | null> {
  const ownerCode = process.env.OWNER_CODE;
  if (ownerCode && safeEqual(hmac("code:" + code), hmac("code:" + ownerCode))) {
    return { id: OWNER_ID, name: ownerName(), owner: true };
  }
  const target = hmac("code:" + code);
  for (const g of await registry()) {
    if (safeEqual(g.passcodeHash, target)) {
      return { id: g.id, name: g.name, owner: false };
    }
  }
  return null;
}

async function resolveGroup(id: string): Promise<Group | null> {
  if (id === OWNER_ID) return { id: OWNER_ID, name: ownerName(), owner: true };
  const g = (await registry()).find((x) => x.id === id);
  return g ? { id: g.id, name: g.name, owner: false } : null;
}

/** The group the current request belongs to (from the signed cookie), or null. */
export async function currentGroup(): Promise<Group | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const dot = raw.lastIndexOf(".");
  if (dot < 1) return null;
  const id = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  if (!safeEqual(sig, hmac("grp:" + id))) return null;
  return resolveGroup(id);
}

export async function setGroupCookie(id: string): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, `${id}.${hmac("grp:" + id)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearGroupCookie(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

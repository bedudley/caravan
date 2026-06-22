import { promises as fs } from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

// Note text + photo URLs. Private text is only ever read server-side after the
// owner cookie checks out (see the GET route), so it never reaches a visitor.
export type Visibility = "public" | "private";
export type Note = { text: string; images: string[]; updatedAt: number };

function keyFor(vis: Visibility, scope: string): string {
  return `note:${vis}:${scope}`;
}

// Upstash KV if configured (prod), else a local JSON fallback (dev) so the whole
// feature is verifiable before any store is provisioned.
const kvUrl = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const kvToken =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = kvUrl && kvToken ? new Redis({ url: kvUrl, token: kvToken }) : null;

const DEV_DIR = path.join(process.cwd(), ".notes-dev");
function devFile(vis: Visibility, scope: string): string {
  return path.join(DEV_DIR, `${vis}__${scope.replace(/[:/\\]/g, "_")}.json`);
}

export async function getNote(
  vis: Visibility,
  scope: string,
): Promise<Note | null> {
  if (redis) return (await redis.get<Note>(keyFor(vis, scope))) ?? null;
  try {
    return JSON.parse(await fs.readFile(devFile(vis, scope), "utf8")) as Note;
  } catch {
    return null;
  }
}

export async function setNote(
  vis: Visibility,
  scope: string,
  note: Note,
): Promise<void> {
  if (redis) {
    await redis.set(keyFor(vis, scope), note);
    return;
  }
  await fs.mkdir(DEV_DIR, { recursive: true });
  await fs.writeFile(devFile(vis, scope), JSON.stringify(note));
}

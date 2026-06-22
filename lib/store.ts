import { promises as fs } from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

// One key/value store for notes + groups. Upstash KV if configured (prod), else
// a local JSON fallback (dev) so the whole feature is verifiable before any store
// is provisioned. JSON in / JSON out.
const kvUrl = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const kvToken =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = kvUrl && kvToken ? new Redis({ url: kvUrl, token: kvToken }) : null;

const DEV_DIR = path.join(process.cwd(), ".notes-dev");
function devFile(key: string): string {
  return path.join(DEV_DIR, key.replace(/[:/\\]/g, "_") + ".json");
}

export async function kvGet<T>(key: string): Promise<T | null> {
  if (redis) return (await redis.get<T>(key)) ?? null;
  try {
    return JSON.parse(await fs.readFile(devFile(key), "utf8")) as T;
  } catch {
    return null;
  }
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  if (redis) {
    await redis.set(key, value);
    return;
  }
  await fs.mkdir(DEV_DIR, { recursive: true });
  await fs.writeFile(devFile(key), JSON.stringify(value));
}

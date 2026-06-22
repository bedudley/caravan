import { randomUUID } from "crypto";
import { kvGet, kvSet } from "./store";

// The travelers' message board: a flat, recency-ordered feed (newest first),
// distinct from the per-day/per-trip notes. Append-only posts so people never
// clobber each other. Visible + writable to any unlocked group (not no-code
// visitors). Stored as a capped JSON list in KV.
export type Post = {
  id: string;
  groupId: string;
  author: string;
  text: string;
  image?: string;
  ts: number;
};

const KEY = "board";
const MAX = 200;

export async function getPosts(): Promise<Post[]> {
  return (await kvGet<Post[]>(KEY)) ?? [];
}

export async function addPost(
  groupId: string,
  author: string,
  text: string,
  image?: string,
): Promise<Post> {
  const post: Post = {
    id: randomUUID(),
    groupId,
    author,
    text: text.slice(0, 1000),
    ...(image ? { image } : {}),
    ts: Date.now(),
  };
  const posts = await getPosts();
  posts.unshift(post);
  await kvSet(KEY, posts.slice(0, MAX));
  return post;
}

/** Delete a post — only its own group, unless the caller is the owner. */
export async function deletePost(
  id: string,
  groupId: string,
  isOwner: boolean,
): Promise<boolean> {
  const posts = await getPosts();
  const target = posts.find((p) => p.id === id);
  if (!target) return false;
  if (target.groupId !== groupId && !isOwner) return false;
  await kvSet(
    KEY,
    posts.filter((p) => p.id !== id),
  );
  return true;
}

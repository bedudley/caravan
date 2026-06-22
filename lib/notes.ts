import { kvGet, kvSet } from "./store";

// Note text + photo URLs. PUBLIC notes are shared (one per scope). PRIVATE notes
// are per-group and only ever read server-side for the matching group cookie.
export type Visibility = "public" | "private";
export type Note = { text: string; images: string[]; updatedAt: number };

function keyFor(vis: Visibility, scope: string, groupId?: string): string {
  return vis === "private"
    ? `note:private:${groupId}:${scope}`
    : `note:public:${scope}`;
}

export async function getNote(
  vis: Visibility,
  scope: string,
  groupId?: string,
): Promise<Note | null> {
  return kvGet<Note>(keyFor(vis, scope, groupId));
}

export async function setNote(
  vis: Visibility,
  scope: string,
  note: Note,
  groupId?: string,
): Promise<void> {
  return kvSet(keyFor(vis, scope, groupId), note);
}

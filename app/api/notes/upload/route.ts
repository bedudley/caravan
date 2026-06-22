import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { put } from "@vercel/blob";
import { isOwner } from "@/lib/owner";

export const dynamic = "force-dynamic";

// Owner-gated photo upload. Uses Vercel Blob in prod (unguessable random URLs);
// falls back to public/uploads locally so the flow works without provisioning.
// The client downscales before sending, so payloads stay well under the limit.
export async function POST(req: Request) {
  if (!(await isOwner())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "no file" }, { status: 400 });
  }
  const ext =
    (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") ||
    "jpg";
  const name = `${randomUUID()}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`notes/${name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });
    return NextResponse.json({ url: blob.url });
  }

  // dev fallback
  const buf = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), buf);
  return NextResponse.json({ url: `/uploads/${name}` });
}

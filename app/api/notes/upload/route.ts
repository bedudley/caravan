import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { put } from "@vercel/blob";
import { currentGroup } from "@/lib/groups";

export const dynamic = "force-dynamic";

// Any unlocked group may upload (for their own notes). Uses Vercel Blob in prod
// (unguessable random URLs); falls back to public/uploads locally so the flow
// works without provisioning. The client downscales before sending.
//
// Blob auth: the modern integration uses OIDC — put() resolves credentials from
// BLOB_STORE_ID + the runtime-injected VERCEL_OIDC_TOKEN (no static token). We
// also accept a legacy BLOB_READ_WRITE_TOKEN if one is ever set.
const blobConfigured = !!(
  process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN
);

export async function POST(req: Request) {
  if (!(await currentGroup())) {
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

  if (blobConfigured) {
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

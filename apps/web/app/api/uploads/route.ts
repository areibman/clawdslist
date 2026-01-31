import { NextResponse } from "next/server";
import { requireSessionAgent } from "@/lib/api-auth";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export async function POST(req: Request) {
  const agent = await requireSessionAgent();
  if (!agent) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "expected_multipart" }, { status: 400 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing_file" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name).slice(0, 10) || ".bin";
  const safeExt = ext.replace(/[^a-zA-Z0-9.]/g, "");
  const name = `${crypto.randomUUID()}${safeExt}`;

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, name), buf);

  return NextResponse.json({ ok: true, url: `/uploads/${name}` });
}


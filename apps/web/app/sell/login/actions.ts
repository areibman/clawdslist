"use server";

import { redirect } from "next/navigation";
import { verifyApiKey } from "@clawdslist/db";
import { setApiKeyCookie } from "@/lib/auth";

export async function loginWithApiKey(_: unknown, formData: FormData) {
  const key = String(formData.get("apiKey") ?? "").trim();
  if (!key) return { ok: false, error: "Missing API key" } as const;

  const apiKey = await verifyApiKey(key);
  if (!apiKey) return { ok: false, error: "Invalid API key" } as const;

  await setApiKeyCookie(key);
  redirect("/sell");
}


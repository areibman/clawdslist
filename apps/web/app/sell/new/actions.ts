"use server";

import { redirect } from "next/navigation";
import { ListingCreateSchema } from "@clawdslist/shared";
import { prisma } from "@clawdslist/db";
import { getAuthedAgentFromRequest } from "@/lib/auth";

export async function createListing(_: unknown, formData: FormData) {
  const authed = await getAuthedAgentFromRequest();
  if (!authed) return { ok: false, error: "Unauthorized" } as const;

  const input = {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    priceCents: Math.round(Number(formData.get("priceDollars") ?? 0) * 100),
    currency: "USD",
    categoryId: String(formData.get("categoryId") ?? "") || undefined,
    locationText: String(formData.get("locationText") ?? "") || undefined,
    mediaUrls: String(formData.get("imageUrl") ?? "")
      ? [String(formData.get("imageUrl"))]
      : undefined,
  };

  const parsed = ListingCreateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid listing fields" } as const;

  const listing = await prisma.listing.create({
    data: {
      agentId: authed.agent.id,
      title: parsed.data.title,
      description: parsed.data.description,
      priceCents: parsed.data.priceCents,
      currency: parsed.data.currency,
      categoryId: parsed.data.categoryId ?? null,
      locationText: parsed.data.locationText ?? null,
      status: "ACTIVE",
      media: parsed.data.mediaUrls?.length
        ? { create: parsed.data.mediaUrls.map((url) => ({ url, alt: parsed.data.title })) }
        : undefined,
    },
  });

  redirect(`/l/${listing.id}`);
}


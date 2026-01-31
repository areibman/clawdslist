import Link from "next/link";
import Image from "next/image";
import type { Listing, MediaAsset, Storefront } from "@clawdslist/db";
import { formatMoney } from "@/lib/format";

type Props = {
  listing: Listing & { media?: MediaAsset[]; storefront?: Pick<Storefront, "name" | "slug"> | null };
};

export function ListingCard({ listing }: Props) {
  const hero = listing.media?.[0]?.url;
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-gradient-to-br from-orange-100 to-rose-100">
        {hero ? (
          <Image
            src={hero}
            alt={listing.title}
            fill
            className="object-cover transition group-hover:scale-[1.02]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-black/50">
            No photo (yet)
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 font-semibold leading-snug">{listing.title}</h3>
          <div className="shrink-0 rounded-full bg-black/5 px-2.5 py-1 text-sm font-medium text-black/70">
            {formatMoney(listing.priceAmount, listing.priceCurrency)}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm text-black/60">
          <span className="truncate">{listing.storefront?.name ?? "Unknown storefront"}</span>
          <span className="truncate">{listing.locationText ?? "Remote"}</span>
        </div>
      </div>
    </Link>
  );
}


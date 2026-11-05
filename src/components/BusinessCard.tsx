import Image from "next/image";
import Link from "next/link";
import { mediaUrl } from "@/lib/media";
import type { Business } from "@/lib/types";

const tierLabel: Record<Business["packageTier"], string> = {
  basic_5k: "Community listing",
  premium_10k: "Featured partner",
  sponsor: "Sponsor",
  comp: "Community",
};

export function BusinessCard({ business }: { business: Business }) {
  const logo = mediaUrl(business.logoPath);

  return (
    <Link
      href={`/businesses/${business.slug}`}
      className="group flex h-full flex-col gap-4 rounded-2xl border border-line bg-surface p-5 transition-shadow hover:shadow-[0_18px_40px_-28px_rgba(0,0,0,0.45)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-paper">
          {logo ? (
            <Image
              src={logo}
              alt={`${business.name} logo`}
              width={56}
              height={56}
              className="h-full w-full object-contain p-1.5"
            />
          ) : (
            <span className="font-display text-xl text-brand">{business.name.slice(0, 1)}</span>
          )}
        </div>
        <span className="rounded-full bg-accent-soft/70 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-brand-ink">
          {tierLabel[business.packageTier]}
        </span>
      </div>

      <div className="space-y-1.5">
        <h3 className="font-display text-lg leading-snug text-ink group-hover:text-brand">
          {business.name}
        </h3>
        <p className="text-xs uppercase tracking-[0.14em] text-muted">{business.category}</p>
        <p className="text-sm leading-relaxed text-muted">{business.tagline}</p>
      </div>

      <div className="mt-auto flex flex-wrap gap-1.5">
        {business.services.slice(0, 3).map((service) => (
          <span
            key={service}
            className="rounded-full border border-line px-2.5 py-1 text-[11px] text-muted"
          >
            {service}
          </span>
        ))}
      </div>
    </Link>
  );
}

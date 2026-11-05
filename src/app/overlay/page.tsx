import { AdCarousel, type CarouselItem } from "@/components/AdCarousel";
import { listLiveBusinesses } from "@/lib/data";
import { mediaUrl } from "@/lib/media";
import "./overlay.css";

export const dynamic = "force-dynamic";

/**
 * OBS / vMix browser source.
 * Transparent background, no chrome — the broadcast operator points a browser
 * source at /overlay and the carousel composites over the video feed.
 */
export default async function OverlayPage() {
  const businesses = await listLiveBusinesses();

  const items: CarouselItem[] = businesses.map((business) => ({
    id: business.id,
    slug: business.slug,
    name: business.name,
    category: business.category,
    tagline: business.tagline,
    logoUrl: mediaUrl(business.logoPath),
    bannerUrl: mediaUrl(business.bannerPath),
  }));

  return (
    <div className="flex min-h-screen items-end justify-start p-10">
      <div className="w-full max-w-3xl rounded-3xl bg-black/35 px-8 py-7 backdrop-blur-sm">
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.28em] text-white/60">
          Partner businesses · District 9215 Foundation Dinner
        </p>
        <AdCarousel items={items} variant="overlay" intervalMs={8000} />
      </div>
    </div>
  );
}

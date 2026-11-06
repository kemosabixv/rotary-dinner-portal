import { AdCarousel, type CarouselItem } from "@/components/AdCarousel";
import { listLiveBusinesses } from "@/lib/data";
import { bannerSource, effectiveBannerUrl, mediaUrl } from "@/lib/media";
import { getOverlayBgMode, type OverlayBgMode } from "@/lib/settings";
import "./overlay.css";

export const dynamic = "force-dynamic";

/**
 * OBS / vMix browser source.
 *
 * transparent — nothing behind the ad card, for compositing over video
 * creative    — the slide itself fills the screen (banner or brand gradient),
 *               for a browser preview or a TV display
 *
 * There is deliberately no on-page switch: nothing here can appear on air.
 * `?bg=creative` or `?bg=transparent` overrides the saved setting for testing.
 */
export default async function OverlayPage({
  searchParams,
}: {
  searchParams: Promise<{ bg?: string }>;
}) {
  const [{ bg }, businesses, savedMode] = await Promise.all([
    searchParams,
    listLiveBusinesses(),
    getOverlayBgMode(),
  ]);

  const mode: OverlayBgMode = bg === "creative" || bg === "transparent" ? bg : savedMode;

  const items: CarouselItem[] = businesses.map((business) => ({
    id: business.id,
    slug: business.slug,
    name: business.name,
    category: business.category,
    tagline: business.tagline,
    logoUrl: mediaUrl(business.logoPath),
    bannerUrl: effectiveBannerUrl(business),
    bannerFallback: bannerSource(business) === "photo",
  }));

  if (mode === "creative") {
    return (
      <AdCarousel
        items={items}
        variant="overlay"
        intervalMs={8000}
        backgroundMode="creative"
        trackImpressions={false}
      />
    );
  }

  return (
    <div className="flex min-h-screen items-end justify-start p-10">
      <div className="w-full max-w-3xl rounded-3xl bg-black/35 px-8 py-7 backdrop-blur-sm">
        <AdCarousel
          items={items}
          variant="overlay"
          intervalMs={8000}
          backgroundMode="transparent"
          trackImpressions={false}
        />
      </div>
    </div>
  );
}



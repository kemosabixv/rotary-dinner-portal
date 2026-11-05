import { AdCarousel, type CarouselItem } from "@/components/AdCarousel";
import { listLiveBusinesses } from "@/lib/data";
import { effectiveBannerUrl, mediaUrl } from "@/lib/media";
import { getOverlayBgMode, type OverlayBgMode } from "@/lib/settings";
import "./overlay.css";

export const dynamic = "force-dynamic";

/**
 * OBS / vMix browser source.
 *
 * Background is controlled by the admin setting (Overlay & broadcast):
 *   transparent — nothing behind the ad card, for compositing over video
 *   creative    — brand gradient + blurred banner behind the card, for browser/TV
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
  }));

  return (
    <div className="flex min-h-screen items-end justify-start p-10">
      <div
        className={
          mode === "creative"
            ? "w-full max-w-3xl rounded-3xl bg-black/45 px-8 py-7 shadow-2xl backdrop-blur-sm"
            : "w-full max-w-3xl rounded-3xl bg-black/35 px-8 py-7 backdrop-blur-sm"
        }
      >
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.28em] text-white/60">
          Partner businesses · District 9215 Foundation Dinner
        </p>
        <AdCarousel items={items} variant="overlay" intervalMs={8000} backgroundMode={mode} />
      </div>
    </div>
  );
}

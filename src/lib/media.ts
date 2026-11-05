export const MEDIA_BUCKET = "business-media";

/** Public URL for an object stored in the business-media bucket. */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`;
}

/**
 * Banner fallback chain: an explicit banner wins, otherwise the photo marked
 * "use as banner" (or simply the first photo), otherwise there is no banner.
 */
export function bannerSource(business: {
  bannerPath: string | null;
  photoPaths: string[];
}): "banner" | "photo" | "none" {
  if (business.bannerPath) {
    return business.photoPaths.includes(business.bannerPath) ? "photo" : "banner";
  }
  return business.photoPaths.length > 0 ? "photo" : "none";
}

export function effectiveBannerUrl(business: {
  bannerPath: string | null;
  photoPaths: string[];
}): string | null {
  return mediaUrl(business.bannerPath) ?? mediaUrl(business.photoPaths[0]);
}

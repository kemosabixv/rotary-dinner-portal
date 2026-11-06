import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { MEDIA_BUCKET } from "./media";
import type {
  Business,
  BusinessInput,
  BusinessStatus,
  PaidStatus,
  PackageTier,
} from "./types";

type BusinessRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  services: string[] | null;
  logo_path: string | null;
  photo_paths: string[] | null;
  video_path: string | null;
  video_poster_path: string | null;
  banner_path: string | null;
  address: string | null;
  maps_url: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  x_url: string | null;
  linkedin: string | null;
  tiktok: string | null;
  youtube: string | null;
  whatsapp: string | null;
  package_tier: PackageTier;
  paid_status: PaidStatus;
  add_ons: string[] | null;
  active_from: string;
  active_to: string;
  status: BusinessStatus;
  carousel_weight: number;
  is_sample: boolean;
  created_at: string;
  updated_at: string;
};

const COLUMNS =
  "id, slug, name, category, tagline, description, services, logo_path, photo_paths, video_path, video_poster_path, banner_path, address, maps_url, phone, email, website, instagram, facebook, x_url, linkedin, tiktok, youtube, whatsapp, package_tier, paid_status, add_ons, active_from, active_to, status, carousel_weight, is_sample, created_at, updated_at";

function toBusiness(row: BusinessRow): Business {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    tagline: row.tagline,
    description: row.description,
    services: row.services ?? [],
    logoPath: row.logo_path,
    photoPaths: row.photo_paths ?? [],
    videoPath: row.video_path,
    videoPosterPath: row.video_poster_path,
    bannerPath: row.banner_path,
    address: row.address,
    mapsUrl: row.maps_url,
    contact: {
      phone: row.phone ?? undefined,
      email: row.email ?? undefined,
      website: row.website ?? undefined,
      socials: {
        instagram: row.instagram ?? undefined,
        facebook: row.facebook ?? undefined,
        x: row.x_url ?? undefined,
        linkedin: row.linkedin ?? undefined,
        tiktok: row.tiktok ?? undefined,
        youtube: row.youtube ?? undefined,
        whatsapp: row.whatsapp ?? undefined,
      },
    },
    packageTier: row.package_tier,
    paidStatus: row.paid_status,
    addOns: (row.add_ons ?? []).filter((addOn): addOn is "poll_quiz" => addOn === "poll_quiz"),
    activeFrom: row.active_from,
    activeTo: row.active_to,
    status: row.status,
    carouselWeight: row.carousel_weight,
    isSample: row.is_sample,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function publicMediaUrl(path: string | null): string | null {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/business-media/${path}`;
}

export async function listBusinesses(): Promise<Business[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("businesses")
    .select(COLUMNS)
    .order("carousel_weight", { ascending: false })
    .order("name", { ascending: true });

  if (error) throw new Error(`Could not load businesses: ${error.message}`);
  return (data as BusinessRow[]).map(toBusiness);
}

export async function listLiveBusinesses(): Promise<Business[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("businesses")
    .select(COLUMNS)
    .eq("status", "live")
    .order("carousel_weight", { ascending: false })
    .order("name", { ascending: true });

  if (error) throw new Error(`Could not load live businesses: ${error.message}`);
  return (data as BusinessRow[]).map(toBusiness);
}

export async function getBusinessBySlug(slug: string): Promise<Business | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("businesses")
    .select(COLUMNS)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`Could not load business: ${error.message}`);
  return data ? toBusiness(data as BusinessRow) : null;
}

/** Public pages: no cookies, so they can be cached at the edge. */
export async function listLiveBusinessesPublic(): Promise<Business[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("businesses")
    .select(COLUMNS)
    .eq("status", "live")
    .order("carousel_weight", { ascending: false })
    .order("name", { ascending: true });

  if (error) throw new Error(`Could not load live businesses: ${error.message}`);
  return (data as BusinessRow[]).map(toBusiness);
}

export async function getLiveBusinessBySlugPublic(slug: string): Promise<Business | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("businesses")
    .select(COLUMNS)
    .eq("slug", slug)
    .eq("status", "live")
    .maybeSingle();

  if (error) throw new Error(`Could not load business: ${error.message}`);
  return data ? toBusiness(data as BusinessRow) : null;
}

export async function getBusinessById(id: string): Promise<Business | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("businesses")
    .select(COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Could not load business: ${error.message}`);
  return data ? toBusiness(data as BusinessRow) : null;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function toRow(input: BusinessInput) {
  return {
    name: input.name,
    category: input.category,
    tagline: input.tagline,
    description: input.description,
    services: input.services,
    address: input.address || null,
    maps_url: input.mapsUrl || null,
    phone: input.phone || null,
    email: input.email || null,
    website: input.website || null,
    instagram: input.socials?.instagram || null,
    facebook: input.socials?.facebook || null,
    x_url: input.socials?.x || null,
    linkedin: input.socials?.linkedin || null,
    tiktok: input.socials?.tiktok || null,
    youtube: input.socials?.youtube || null,
    whatsapp: input.socials?.whatsapp || null,
    package_tier: input.packageTier,
    paid_status: input.paidStatus,
    add_ons: input.pollQuiz ? ["poll_quiz"] : [],
    active_from: input.activeFrom,
    active_to: input.activeTo,
    status: input.status,
    carousel_weight: input.carouselWeight,
  };
}

export async function createBusiness(input: BusinessInput): Promise<Business> {
  const supabase = await createClient();
  const baseSlug = slugify(input.name) || `business-${Date.now()}`;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${Math.random().toString(36).slice(2, 5)}`;
    const { data, error } = await supabase
      .from("businesses")
      .insert({ ...toRow(input), slug })
      .select(COLUMNS)
      .single();

    if (!error) return toBusiness(data as BusinessRow);
    // 23505 = unique violation on slug; retry with a suffix.
    if (error.code !== "23505") throw new Error(`Could not create business: ${error.message}`);
  }

  throw new Error("Could not create business: slug conflict");
}

export async function updateBusiness(id: string, input: BusinessInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("businesses").update(toRow(input)).eq("id", id);
  if (error) throw new Error(`Could not save business: ${error.message}`);
}

/**
 * What a business may change about its own listing. Commercial fields
 * (package, payment, status, weighting, dates) stay with staff, and a database
 * trigger enforces that even if someone calls the API directly.
 */
export async function updateOwnListing(id: string, input: BusinessInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("businesses")
    .update({
      name: input.name,
      category: input.category,
      tagline: input.tagline,
      description: input.description,
      services: input.services,
      address: input.address || null,
      maps_url: input.mapsUrl || null,
      phone: input.phone || null,
      email: input.email || null,
      website: input.website || null,
      instagram: input.socials?.instagram || null,
      facebook: input.socials?.facebook || null,
      x_url: input.socials?.x || null,
      linkedin: input.socials?.linkedin || null,
      tiktok: input.socials?.tiktok || null,
      youtube: input.socials?.youtube || null,
      whatsapp: input.socials?.whatsapp || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(`Could not save listing: ${error.message}`);
}

export async function setStatus(id: string, status: BusinessStatus): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("businesses").update({ status }).eq("id", id);
  if (error) throw new Error(`Could not update status: ${error.message}`);
}

export async function setPaidStatus(id: string, paidStatus: PaidStatus): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("businesses").update({ paid_status: paidStatus }).eq("id", id);
  if (error) throw new Error(`Could not update payment status: ${error.message}`);
}

export async function updateMedia(
  id: string,
  media: {
    logoPath: string | null;
    photoPaths: string[];
    videoPath?: string | null;
    videoPosterPath?: string | null;
    bannerPath?: string | null;
  },
): Promise<void> {
  const supabase = await createClient();
  const patch: Record<string, unknown> = { logo_path: media.logoPath, photo_paths: media.photoPaths };
  if (media.videoPath !== undefined) patch.video_path = media.videoPath;
  if (media.videoPosterPath !== undefined) patch.video_poster_path = media.videoPosterPath;
  if (media.bannerPath !== undefined) patch.banner_path = media.bannerPath;

  const { error } = await supabase.from("businesses").update(patch).eq("id", id);

  if (error) throw new Error(`Could not save media: ${error.message}`);
}

export async function deleteBusiness(id: string): Promise<void> {
  const supabase = await createClient();

  // Remove the listing's media first so the bucket does not collect orphans.
  const { data: files } = await supabase.storage.from(MEDIA_BUCKET).list(id, { limit: 100 });
  if (files && files.length > 0) {
    await supabase.storage.from(MEDIA_BUCKET).remove(files.map((file) => `${id}/${file.name}`));
  }

  const { error } = await supabase.from("businesses").delete().eq("id", id);
  if (error) throw new Error(`Could not delete business: ${error.message}`);
}

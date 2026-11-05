export type PackageTier = "basic_5k" | "premium_10k" | "sponsor" | "comp";
export type PaidStatus = "pending" | "paid" | "waived";
export type BusinessStatus = "submitted" | "approved" | "live" | "expired";

export type SocialLinks = {
  instagram?: string;
  facebook?: string;
  x?: string;
  linkedin?: string;
  tiktok?: string;
  youtube?: string;
  whatsapp?: string;
};

export type Business = {
  id: string;
  slug: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  services: string[];
  /** Supabase Storage object path inside the `business-media` bucket. */
  logoPath: string | null;
  /** Supabase Storage object paths, in display order. */
  photoPaths: string[];
  /** Optional short promo video (mp4/webm) and its poster frame. */
  videoPath: string | null;
  videoPosterPath: string | null;
  address: string | null;
  mapsUrl: string | null;
  contact: {
    phone?: string;
    email?: string;
    website?: string;
    socials: SocialLinks;
  };
  packageTier: PackageTier;
  paidStatus: PaidStatus;
  addOns: Array<"poll_quiz">;
  activeFrom: string;
  activeTo: string;
  status: BusinessStatus;
  carouselWeight: number;
  /** Sample content shown before real businesses are loaded. */
  isSample: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Tier = {
  id: PackageTier;
  name: string;
  priceKes: number | null;
  priceLabel: string;
  summary: string;
  includes: string[];
  /** Fields still waiting on the package one-pager. */
  pending: string[];
  featured?: boolean;
};

export type PackagesConfig = {
  currency: string;
  note: string;
  tiers: Tier[];
  addOn: {
    id: "poll_quiz";
    name: string;
    priceKes: number | null;
    summary: string;
    includes: string[];
    pending: string[];
  };
};

export type BusinessInput = {
  name: string;
  category: string;
  tagline: string;
  description: string;
  services: string[];
  address?: string;
  mapsUrl?: string;
  phone?: string;
  email?: string;
  website?: string;
  socials?: SocialLinks;
  packageTier: PackageTier;
  paidStatus: PaidStatus;
  status: BusinessStatus;
  carouselWeight: number;
  activeFrom: string;
  activeTo: string;
  pollQuiz: boolean;
};

export type PollStatus = "draft" | "live" | "closed";

export type PollQuestion = {
  id: string;
  position: number;
  prompt: string;
  kind: "choice" | "text";
  options: string[];
  required: boolean;
};

export type Poll = {
  id: string;
  businessId: string;
  slug: string;
  title: string;
  intro: string;
  status: PollStatus;
  couponLabel: string | null;
  couponPrefix: string;
  createdAt: string;
  updatedAt: string;
  questions: PollQuestion[];
};

export type PollResponse = {
  id: string;
  pollId: string;
  answers: Record<string, string>;
  respondentName: string | null;
  respondentContact: string | null;
  respondentEmail: string | null;
  couponCode: string | null;
  couponEmailStatus: string | null;
  createdAt: string;
};

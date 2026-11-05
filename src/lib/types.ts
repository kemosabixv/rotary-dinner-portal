export type PackageTier = "basic_5k" | "premium_10k" | "sponsor" | "comp";
export type PaidStatus = "pending" | "paid" | "waived";
export type BusinessStatus = "submitted" | "approved" | "live" | "expired";

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
  contact: {
    phone?: string;
    email?: string;
    website?: string;
    socials?: string;
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
  phone?: string;
  email?: string;
  website?: string;
  socials?: string;
  packageTier: PackageTier;
  paidStatus: PaidStatus;
  status: BusinessStatus;
  carouselWeight: number;
  activeFrom: string;
  activeTo: string;
  pollQuiz: boolean;
};

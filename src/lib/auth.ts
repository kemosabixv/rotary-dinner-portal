import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type Role = "superadmin" | "admin" | "business";
export type BusinessRole = "owner" | "editor" | "viewer";

export type Profile = {
  userId: string;
  email: string | null;
  role: Role;
  businessId: string | null;
  /** Access level inside that business; null when not linked to one. */
  businessRole: BusinessRole | null;
};

/** Cached per request: the header and the page share one lookup. */
export const getProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data }, { data: membership }] = await Promise.all([
    supabase
      .from("profiles")
      .select("user_id, email, role, business_id")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("business_members")
      .select("business_id, role")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  const legacyBusinessId = (data?.business_id as string | null) ?? null;
  const membershipRole = (membership?.role as BusinessRole | undefined) ?? null;

  return {
    userId: user.id,
    email: data?.email ?? user.email ?? null,
    role: (data?.role as Role) ?? "business",
    businessId: (membership?.business_id as string | undefined) ?? legacyBusinessId,
    businessRole: membershipRole ?? (legacyBusinessId ? "owner" : null),
  };
});

/** True when this person may change the listing, its media and its polls. */
export function canWriteBusiness(profile: Profile | null): boolean {
  return profile?.businessRole === "owner" || profile?.businessRole === "editor";
}

/** True when this person may approve requests and change member roles. */
export function ownsBusiness(profile: Profile | null): boolean {
  return profile?.businessRole === "owner";
}

/** Where a signed-in user should land. */
export function homeFor(role: Role): string {
  return role === "business" ? "/portal" : "/admin";
}

import { createClient } from "@/lib/supabase/server";

export type Role = "superadmin" | "admin" | "business";

export type Profile = {
  userId: string;
  email: string | null;
  role: Role;
  businessId: string | null;
};

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("user_id, email, role, business_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    email: data?.email ?? user.email ?? null,
    role: (data?.role as Role) ?? "business",
    businessId: data?.business_id ?? null,
  };
}

/** Where a signed-in user should land. */
export function homeFor(role: Role): string {
  return role === "business" ? "/portal" : "/admin";
}

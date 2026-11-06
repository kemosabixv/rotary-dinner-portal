"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

async function requireSuperadmin() {
  const profile = await getProfile();
  if (!profile || profile.role !== "superadmin") redirect("/admin");
  return profile;
}

export async function updateUserAction(formData: FormData) {
  const me = await requireSuperadmin();

  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "business");
  const businessId = String(formData.get("businessId") ?? "");

  if (!userId) redirect("/admin/users");
  if (!["superadmin", "admin", "business"].includes(role)) redirect("/admin/users");
  if (userId === me.userId && role !== "superadmin") {
    redirect(`/admin/users?error=${encodeURIComponent("You cannot remove your own superadmin access.")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role, business_id: businessId || null })
    .eq("user_id", userId);

  if (error) {
    redirect(`/admin/users?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?saved=1");
}

export async function deleteUserAction(formData: FormData) {
  const me = await requireSuperadmin();
  const userId = String(formData.get("userId") ?? "");

  if (!userId) redirect("/admin/users");
  if (userId === me.userId) {
    redirect(`/admin/users?error=${encodeURIComponent("You cannot remove your own account.")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").delete().eq("user_id", userId);

  if (error) {
    redirect(`/admin/users?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?saved=1");
}

export async function createUserAction(formData: FormData) {
  await requireSuperadmin();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "business");
  const businessId = String(formData.get("businessId") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_create_user", {
    p_email: email,
    p_password: password,
    p_role: role,
    p_business_id: businessId || null,
  });

  if (error) {
    redirect(`/admin/users?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?created=1");
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function requestLinkAction(formData: FormData) {
  const profile = await getProfile();
  if (!profile) redirect("/sign-in?next=/portal/link");
  if (profile.businessId) redirect("/portal");

  const businessId = String(formData.get("businessId") ?? "");
  const message = String(formData.get("message") ?? "").trim().slice(0, 300);
  if (!businessId) fail("/portal/link", "Choose a business first.");

  const supabase = await createClient();
  const { error } = await supabase.rpc("request_business_link", {
    p_business: businessId,
    p_message: message || null,
  });

  if (error) fail("/portal/link", error.message);

  revalidatePath("/", "layout");
  redirect("/portal/link?requested=1");
}

export async function decideRequestAction(formData: FormData) {
  const profile = await getProfile();
  if (!profile) redirect("/sign-in?next=/portal/members");
  if (profile.role !== "business" || profile.businessRole !== "owner") {
    redirect("/portal");
  }

  const requestId = String(formData.get("requestId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (!requestId || !["accept", "deny"].includes(decision)) {
    fail("/portal/members", "That request could not be read.");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("decide_business_link", {
    p_request: requestId,
    p_accept: decision === "accept",
  });

  if (error) fail("/portal/members", error.message);

  revalidatePath("/", "layout");
  redirect("/portal/members?done=1");
}

export async function setMemberRoleAction(formData: FormData) {
  const profile = await getProfile();
  if (!profile) redirect("/sign-in?next=/portal/members");
  if (profile.role !== "business" || profile.businessRole !== "owner" || !profile.businessId) {
    redirect("/portal");
  }

  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "");
  if (!userId || !["owner", "editor", "viewer"].includes(role)) {
    fail("/portal/members", "Pick a valid role.");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_business_member_role", {
    p_business: profile.businessId,
    p_user: userId,
    p_role: role,
  });

  if (error) fail("/portal/members", error.message);

  revalidatePath("/", "layout");
  redirect("/portal/members?saved=1");
}

export async function removeMemberAction(formData: FormData) {
  const profile = await getProfile();
  if (!profile) redirect("/sign-in?next=/portal/members");
  if (profile.role !== "business" || profile.businessRole !== "owner" || !profile.businessId) {
    redirect("/portal");
  }

  const userId = String(formData.get("userId") ?? "");
  if (!userId) fail("/portal/members", "Pick a person to remove.");

  const supabase = await createClient();
  const { error } = await supabase.rpc("remove_business_member", {
    p_business: profile.businessId,
    p_user: userId,
  });

  if (error) fail("/portal/members", error.message);

  revalidatePath("/", "layout");
  redirect("/portal/members?removed=1");
}

export async function markNotificationsReadAction() {
  const profile = await getProfile();
  if (!profile) redirect("/sign-in");

  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", profile.userId)
    .is("read_at", null);

  revalidatePath("/portal");
  redirect("/portal");
}

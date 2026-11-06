"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function text(formData: FormData, name: string, max = 500): string {
  return String(formData.get(name) ?? "").trim().slice(0, max);
}

function payloadFrom(formData: FormData) {
  const services = String(formData.get("services") ?? "")
    .split(/\r?\n|,/)
    .map((service) => service.trim())
    .filter(Boolean)
    .slice(0, 12);

  return {
    name: text(formData, "name", 160),
    category: text(formData, "category", 80) || "General",
    tagline: text(formData, "tagline", 200),
    description: text(formData, "description", 2000),
    services,
    address: text(formData, "address", 200),
    mapsUrl: text(formData, "mapsUrl", 300),
    phone: text(formData, "phone", 40),
    email: text(formData, "email", 160),
    website: text(formData, "website", 300),
    socials: {
      instagram: text(formData, "instagram", 300),
      facebook: text(formData, "facebook", 300),
      x: text(formData, "x_url", 300),
      linkedin: text(formData, "linkedin", 300),
      tiktok: text(formData, "tiktok", 300),
      youtube: text(formData, "youtube", 300),
      whatsapp: text(formData, "whatsapp", 40),
    },
    pollQuiz: false,
  };
}

/** A paying business creates its listing and becomes its owner. */
export async function createOwnBusinessAction(formData: FormData) {
  const profile = await getProfile();
  if (!profile) redirect("/sign-in?next=/portal/create");
  if (profile.role !== "business") redirect("/admin");
  if (profile.businessId) redirect("/portal");

  const ref = text(formData, "paymentRef", 80);
  const back = ref ? `/portal/create?ref=${encodeURIComponent(ref)}` : "/portal/create";
  const payload = payloadFrom(formData);

  if (!payload.name) fail(back, "Business name is required.");
  if (!ref) fail(back, "Choose the payment you want to use.");

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_own_business", {
    p_payment_ref: ref,
    p_payload: payload,
  });

  if (error) fail(back, error.message);

  revalidatePath("/", "layout");
  redirect("/portal/listing?saved=1");
}

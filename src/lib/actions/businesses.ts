"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createBusiness,
  deleteBusiness,
  setPaidStatus,
  setStatus,
  updateBusiness,
  updateMedia,
} from "@/lib/data";
import type { BusinessInput, BusinessStatus, PaidStatus, PackageTier } from "@/lib/types";
import { requireUser } from "./guard";

function parseBusinessForm(formData: FormData): BusinessInput {
  const services = String(formData.get("services") ?? "")
    .split(/\r?\n|,/)
    .map((service) => service.trim())
    .filter(Boolean)
    .slice(0, 12);

  const weight = Number(formData.get("carouselWeight") ?? 1);

  return {
    name: String(formData.get("name") ?? "").trim(),
    category: String(formData.get("category") ?? "General").trim() || "General",
    tagline: String(formData.get("tagline") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    services,
    phone: String(formData.get("phone") ?? "").trim() || undefined,
    email: String(formData.get("email") ?? "").trim() || undefined,
    website: String(formData.get("website") ?? "").trim() || undefined,
    socials: String(formData.get("socials") ?? "").trim() || undefined,
    packageTier: (String(formData.get("packageTier") ?? "basic_5k") as PackageTier) ?? "basic_5k",
    paidStatus: (String(formData.get("paidStatus") ?? "pending") as PaidStatus) ?? "pending",
    status: (String(formData.get("status") ?? "submitted") as BusinessStatus) ?? "submitted",
    carouselWeight: Number.isFinite(weight) ? Math.min(5, Math.max(1, Math.round(weight))) : 1,
    activeFrom: String(formData.get("activeFrom") ?? "").slice(0, 10) || new Date().toISOString().slice(0, 10),
    activeTo: String(formData.get("activeTo") ?? "").slice(0, 10) || "2026-12-31",
    pollQuiz: formData.get("pollQuiz") === "on",
  };
}

export async function createBusinessAction(formData: FormData) {
  await requireUser();
  const input = parseBusinessForm(formData);

  if (!input.name) {
    redirect("/admin?notice=Business+name+is+required");
  }

  const business = await createBusiness(input);
  revalidatePath("/", "layout");
  redirect(`/admin/${business.id}?saved=1`);
}

export async function updateBusinessAction(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin");

  await updateBusiness(id, parseBusinessForm(formData));
  revalidatePath("/", "layout");
  redirect(`/admin/${id}?saved=1`);
}

export async function deleteBusinessAction(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin");

  await deleteBusiness(id);
  revalidatePath("/", "layout");
  redirect("/admin?notice=Business+deleted");
}

export async function setStatusAction(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as BusinessStatus;
  if (!id || !["submitted", "approved", "live", "expired"].includes(status)) redirect("/admin");

  await setStatus(id, status);
  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function setPaidAction(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  const paidStatus = String(formData.get("paidStatus") ?? "") as PaidStatus;
  if (!id || !["pending", "paid", "waived"].includes(paidStatus)) redirect("/admin");

  await setPaidStatus(id, paidStatus);
  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function updateMediaAction(
  id: string,
  media: { logoPath: string | null; photoPaths: string[] },
) {
  await requireUser();
  await updateMedia(id, media);
  revalidatePath("/", "layout");
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { setOverlayBgMode, setQrBaseUrl, type OverlayBgMode } from "@/lib/settings";
import { requireUser } from "./guard";

export async function setOverlayBgModeAction(formData: FormData) {
  await requireUser();

  const mode: OverlayBgMode =
    String(formData.get("mode") ?? "transparent") === "creative" ? "creative" : "transparent";

  await setOverlayBgMode(mode);
  revalidatePath("/admin");
  revalidatePath("/overlay");
}

export async function setQrBaseUrlAction(formData: FormData) {
  await requireUser();

  const raw = String(formData.get("baseUrl") ?? "").trim();

  if (raw && !/^https?:\/\//i.test(raw)) {
    redirect(`/admin/cards?error=${encodeURIComponent("Enter a full URL starting with https://")}`);
  }

  await setQrBaseUrl(raw);
  revalidatePath("/admin/cards");
  redirect("/admin/cards?saved=1");
}

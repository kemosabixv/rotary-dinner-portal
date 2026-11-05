"use server";

import { revalidatePath } from "next/cache";
import { setOverlayBgMode, type OverlayBgMode } from "@/lib/settings";
import { requireUser } from "./guard";

export async function setOverlayBgModeAction(formData: FormData) {
  await requireUser();

  const mode: OverlayBgMode =
    String(formData.get("mode") ?? "transparent") === "creative" ? "creative" : "transparent";

  await setOverlayBgMode(mode);
  revalidatePath("/admin");
  revalidatePath("/overlay");
}

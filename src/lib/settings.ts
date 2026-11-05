import { createClient } from "@/lib/supabase/server";

export type OverlayBgMode = "transparent" | "creative";

const KEY = "overlay_bg_mode";

export async function getOverlayBgMode(): Promise<OverlayBgMode> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", KEY)
    .maybeSingle();

  if (error || !data) return "transparent";
  return data.value === "creative" ? "creative" : "transparent";
}

export async function setOverlayBgMode(mode: OverlayBgMode): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("settings").upsert({ key: KEY, value: mode });
  if (error) throw new Error(`Could not save setting: ${error.message}`);
}

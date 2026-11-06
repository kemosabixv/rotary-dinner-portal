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

/**
 * Base URL printed into QR codes. Empty means "use the host serving the page",
 * which is what you want until the real subdomain exists.
 */
export async function getQrBaseUrl(): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "qr_base_url")
    .maybeSingle();

  if (error || !data?.value) return "";
  return String(data.value).trim().replace(/\/+$/, "");
}

export async function setQrBaseUrl(baseUrl: string): Promise<void> {
  const supabase = await createClient();
  const cleaned = baseUrl.trim().replace(/\/+$/, "");
  const { error } = await supabase.from("settings").upsert({ key: "qr_base_url", value: cleaned });
  if (error) throw new Error(`Could not save QR base URL: ${error.message}`);
}

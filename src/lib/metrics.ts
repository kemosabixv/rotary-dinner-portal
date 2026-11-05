import { createClient } from "@/lib/supabase/server";

export type MetricTotals = {
  businessId: string;
  impressions: number;
  clicks: number;
  impressions7d: number;
  clicks7d: number;
};

type Row = {
  business_id: string;
  impressions: number | string;
  clicks: number | string;
  impressions_7d: number | string;
  clicks_7d: number | string;
};

export async function listMetricTotals(): Promise<Map<string, MetricTotals>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("business_metric_totals").select("*");

  const map = new Map<string, MetricTotals>();
  if (error) return map;

  for (const row of data as Row[]) {
    map.set(row.business_id, {
      businessId: row.business_id,
      impressions: Number(row.impressions),
      clicks: Number(row.clicks),
      impressions7d: Number(row.impressions_7d),
      clicks7d: Number(row.clicks_7d),
    });
  }
  return map;
}

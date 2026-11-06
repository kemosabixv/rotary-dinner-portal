import { createClient } from "@/lib/supabase/server";

export type MetricTotals = {
  businessId: string;
  impressions: number;
  clicks: number;
  adClicks: number;
  contactClicks: number;
  impressions7d: number;
  clicks7d: number;
  adClicks7d: number;
  contactClicks7d: number;
};

type Row = {
  business_id: string;
  impressions: number | string;
  clicks: number | string;
  ad_clicks: number | string;
  contact_clicks: number | string;
  impressions_7d: number | string;
  clicks_7d: number | string;
  ad_clicks_7d: number | string;
  contact_clicks_7d: number | string;
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
      adClicks: Number(row.ad_clicks),
      contactClicks: Number(row.contact_clicks),
      impressions7d: Number(row.impressions_7d),
      clicks7d: Number(row.clicks_7d),
      adClicks7d: Number(row.ad_clicks_7d),
      contactClicks7d: Number(row.contact_clicks_7d),
    });
  }
  return map;
}

export type DailyMetric = {
  day: string;
  impressions: number;
  clicks: number;
  adClicks: number;
  contactClicks: number;
};

export async function getBusinessMetrics(
  businessId: string,
  days = 14,
): Promise<{ totals: MetricTotals; daily: DailyMetric[] }> {
  const supabase = await createClient();

  const [{ data: totalRows }, { data: dailyRows }] = await Promise.all([
    supabase.from("business_metric_totals").select("*").eq("business_id", businessId),
    supabase
      .from("business_daily_metrics")
      .select("day, impressions, clicks, ad_clicks, contact_clicks")
      .eq("business_id", businessId),
  ]);

  const row = (totalRows as Row[] | null)?.[0];
  const totals: MetricTotals = {
    businessId,
    impressions: Number(row?.impressions ?? 0),
    clicks: Number(row?.clicks ?? 0),
    adClicks: Number(row?.ad_clicks ?? 0),
    contactClicks: Number(row?.contact_clicks ?? 0),
    impressions7d: Number(row?.impressions_7d ?? 0),
    clicks7d: Number(row?.clicks_7d ?? 0),
    adClicks7d: Number(row?.ad_clicks_7d ?? 0),
    contactClicks7d: Number(row?.contact_clicks_7d ?? 0),
  };

  type DailyRow = {
    day: string;
    impressions: number | string;
    clicks: number | string;
    ad_clicks: number | string;
    contact_clicks: number | string;
  };

  const byDay = new Map<string, DailyMetric>();
  for (const entry of (dailyRows ?? []) as DailyRow[]) {
    byDay.set(entry.day, {
      day: entry.day,
      impressions: Number(entry.impressions),
      clicks: Number(entry.clicks),
      adClicks: Number(entry.ad_clicks),
      contactClicks: Number(entry.contact_clicks),
    });
  }

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const daily: DailyMetric[] = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const key = formatter.format(new Date(Date.now() - offset * 86_400_000));
    daily.push(
      byDay.get(key) ?? {
        day: key,
        impressions: 0,
        clicks: 0,
        adClicks: 0,
        contactClicks: 0,
      },
    );
  }

  return { totals, daily };
}

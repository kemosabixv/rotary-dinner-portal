import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const businessId = String(body?.businessId ?? "");
  const kind = String(body?.kind ?? "");
  const source = String(body?.source ?? "").slice(0, 40) || null;

  if (!UUID.test(businessId) || !["impression", "click"].includes(kind)) {
    return new Response(null, { status: 204 });
  }

  const supabase = await createClient();
  await supabase.from("business_events").insert({ business_id: businessId, kind, source });

  return new Response(null, { status: 204 });
}

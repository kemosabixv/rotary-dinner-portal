import { createClient } from "@/lib/supabase/server";

export type BusinessMember = {
  userId: string;
  email: string | null;
  role: "owner" | "editor" | "viewer";
  createdAt: string;
};

export type LinkRequest = {
  id: string;
  userId: string;
  businessId: string | null;
  businessName: string | null;
  email: string | null;
  message: string | null;
  status: "pending" | "accepted" | "denied";
  createdAt: string;
};

export type AppNotification = {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

type MemberRow = { user_id: string; email: string | null; role: BusinessMember["role"]; created_at: string };
type RequestRow = {
  id: string;
  user_id: string;
  email: string | null;
  message: string | null;
  status: LinkRequest["status"];
  created_at: string;
};

export async function listBusinessMembers(businessId: string): Promise<BusinessMember[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_business_members", { p_business: businessId });
  if (error) throw new Error(`Could not load members: ${error.message}`);

  return ((data ?? []) as MemberRow[]).map((row) => ({
    userId: row.user_id,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
  }));
}

export async function listBusinessRequests(businessId: string): Promise<LinkRequest[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_business_requests", { p_business: businessId });
  if (error) throw new Error(`Could not load requests: ${error.message}`);

  return ((data ?? []) as RequestRow[]).map((row) => ({
    id: row.id,
    userId: row.user_id,
    businessId: null,
    businessName: null,
    email: row.email,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  }));
}

export async function listMyLinkRequests(): Promise<LinkRequest[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("business_link_requests")
    .select("id, user_id, business_id, message, status, created_at, businesses(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Could not load your requests: ${error.message}`);

  return ((data ?? []) as {
    id: string;
    user_id: string;
    business_id: string | null;
    message: string | null;
    status: LinkRequest["status"];
    created_at: string;
    businesses: { name: string }[] | null;
  }[]).map((row) => ({
    id: row.id,
    userId: row.user_id,
    businessId: row.business_id,
    businessName: row.businesses?.[0]?.name ?? null,
    email: null,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  }));
}

export async function listNotifications(limit = 20): Promise<AppNotification[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select("id, kind, title, body, href, read_at, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Could not load notifications: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id as string,
    kind: row.kind as string,
    title: row.title as string,
    body: row.body as string | null,
    href: row.href as string | null,
    readAt: row.read_at as string | null,
    createdAt: row.created_at as string,
  }));
}

export async function unreadNotificationCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);

  return count ?? 0;
}

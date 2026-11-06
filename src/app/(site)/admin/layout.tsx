import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/actions/auth";
import { getProfile, homeFor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const profile = await getProfile();
  if (!profile || (profile.role !== "admin" && profile.role !== "superadmin")) {
    redirect(homeFor(profile?.role ?? "business"));
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5 print:hidden">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Portal admin</p>
          <p className="text-sm text-ink">
            Signed in as <span className="font-medium">{user.email}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/businesses"
            className="rounded-full border border-line px-4 py-2 text-sm text-muted hover:border-brand hover:text-brand"
          >
            View public site
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-ink"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>

      <div className="pt-8">{children}</div>
    </div>
  );
}

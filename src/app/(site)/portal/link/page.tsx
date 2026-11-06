import Link from "next/link";
import { redirect } from "next/navigation";
import { requestLinkAction } from "@/lib/actions/members";
import { getProfile } from "@/lib/auth";
import { listLiveBusinesses } from "@/lib/data";
import { mediaUrl } from "@/lib/media";
import { listMyLinkRequests } from "@/lib/members";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Link to a business",
};

export default async function LinkBusinessPage({
  searchParams,
}: {
  searchParams: Promise<{ requested?: string; error?: string }>;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/sign-in?next=/portal/link");
  if (profile.role !== "business") redirect("/admin");
  if (profile.businessId) redirect("/portal");

  const [{ requested, error }, businesses, requests] = await Promise.all([
    searchParams,
    listLiveBusinesses(),
    listMyLinkRequests(),
  ]);

  const pendingBusinessIds = new Set<string>();
  for (const request of requests) {
    if (request.status === "pending" && request.businessId) {
      pendingBusinessIds.add(request.businessId);
    }
  }

  return (
    <section className="mx-auto w-full max-w-4xl space-y-8 px-5 py-12">
      <div>
        <Link href="/portal" className="text-sm text-muted hover:text-brand">
          ← My business
        </Link>
        <h1 className="mt-2 font-display text-3xl tracking-tight text-ink">Link to a business</h1>
        <p className="mt-1 text-sm text-muted">
          Pick the listing you work with. The owner gets your request and decides whether to grant
          access. Until then you can browse the directory.
        </p>
      </div>

      {requested && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Request sent. You&apos;ll get a notification here when the owner responds.
        </p>
      )}
      {error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      )}

      {requests.length > 0 && (
        <section className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="font-display text-lg text-ink">Your requests</h2>
          <ul className="mt-3 divide-y divide-line text-sm">
            {requests.map((request) => (
              <li key={request.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="text-ink">{request.businessName ?? "Business"}</span>
                <span className="text-xs text-muted">
                  {new Date(request.createdAt).toLocaleDateString("en-KE")}
                </span>
                <span
                  className={
                    request.status === "pending"
                      ? "rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-800"
                      : request.status === "accepted"
                        ? "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-800"
                        : "rounded-full border border-line bg-paper px-3 py-1 text-xs text-muted"
                  }
                >
                  {request.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="space-y-3">
        {businesses.map((business) => (
          <div
            key={business.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-4"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-paper">
                {business.logoPath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mediaUrl(business.logoPath) ?? ""}
                    alt={business.name}
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <span className="text-[10px] text-muted">No logo</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{business.name}</p>
                <p className="truncate text-xs text-muted">
                  {business.category}
                  {business.tagline ? ` · ${business.tagline}` : ""}
                </p>
              </div>
            </div>

            {pendingBusinessIds.has(business.id) ? (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-800">
                Request pending
              </span>
            ) : (
              <form action={requestLinkAction} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="businessId" value={business.id} />
                <input
                  name="message"
                  placeholder="Optional note for the owner"
                  className="w-52 rounded-full border border-line bg-surface px-3 py-1.5 text-xs outline-none focus:border-brand"
                />
                <button
                  type="submit"
                  className="rounded-full bg-brand px-4 py-1.5 text-xs font-medium text-white hover:bg-brand-ink"
                >
                  Request access
                </button>
              </form>
            )}
          </div>
        ))}
        {businesses.length === 0 && (
          <p className="rounded-2xl border border-line bg-surface p-6 text-sm text-muted">
            No live listings to link to yet.
          </p>
        )}
      </div>
    </section>
  );
}

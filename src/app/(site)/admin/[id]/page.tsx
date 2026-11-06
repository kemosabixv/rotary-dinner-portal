import Link from "next/link";
import { notFound } from "next/navigation";
import { BusinessForm } from "@/components/BusinessForm";
import { MediaManager } from "@/components/MediaManager";
import { deleteBusinessAction, updateBusinessAction } from "@/lib/actions/businesses";
import { getBusinessById } from "@/lib/data";
import { getBusinessMetrics } from "@/lib/metrics";

export const dynamic = "force-dynamic";

export default async function EditBusinessPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  const business = await getBusinessById(id);

  if (!business) notFound();

  const { totals, daily } = await getBusinessMetrics(business.id);
  const maxDaily = Math.max(
    1,
    ...daily.map((entry) =>
      Math.max(entry.impressions, entry.adClicks, entry.contactClicks),
    ),
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin" className="text-sm text-muted hover:text-brand">
            ← All businesses
          </Link>
          <h1 className="mt-2 font-display text-2xl text-ink">{business.name}</h1>
          <p className="text-sm text-muted">
            /businesses/{business.slug} · updated {new Date(business.updatedAt).toLocaleString("en-KE")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/${business.id}/polls`}
            className="rounded-full border border-line px-4 py-2 text-sm text-muted hover:border-brand hover:text-brand"
          >
            Polls &amp; quizzes
          </Link>
          {business.status === "live" && (
            <Link
              href={`/businesses/${business.slug}`}
              className="rounded-full border border-line px-4 py-2 text-sm text-muted hover:border-brand hover:text-brand"
            >
              View public page
            </Link>
          )}
        </div>
      </div>

      {saved && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Saved.
        </p>
      )}

      <section id="analytics" className="rounded-2xl border border-line bg-surface p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-lg text-ink">Analytics</h2>
          <p className="text-xs text-muted">
            All time: {totals.impressions} views · {totals.adClicks} ad clicks ·{" "}
            {totals.contactClicks} contact clicks
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { label: "Views (7d)", value: totals.impressions7d },
            { label: "Ad clicks (7d)", value: totals.adClicks7d },
            { label: "Contact clicks (7d)", value: totals.contactClicks7d },
            { label: "Views (all time)", value: totals.impressions },
            { label: "Ad clicks (all time)", value: totals.adClicks },
            { label: "Contact clicks (all time)", value: totals.contactClicks },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-line bg-paper/60 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{stat.label}</p>
              <p className="mt-1 font-display text-2xl text-ink">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <div className="flex h-28 items-end gap-1.5">
            {daily.map((entry) => (
              <div
                key={entry.day}
                className="flex h-full flex-1 items-end gap-[2px]"
                title={`${entry.day}: ${entry.impressions} views, ${entry.adClicks} ad clicks, ${entry.contactClicks} contact clicks`}
              >
                <div
                  className="flex-1 rounded-t bg-brand/70"
                  style={{ height: `${Math.round((entry.impressions / maxDaily) * 100)}%` }}
                />
                <div
                  className="flex-1 rounded-t bg-accent"
                  style={{ height: `${Math.round((entry.adClicks / maxDaily) * 100)}%` }}
                />
                <div
                  className="flex-1 rounded-t bg-emerald-500/80"
                  style={{ height: `${Math.round((entry.contactClicks / maxDaily) * 100)}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted">
            <span>{daily[0]?.day}</span>
            <span>{daily[daily.length - 1]?.day}</span>
          </div>
          <p className="mt-3 text-xs text-muted">
            <span className="mr-1 inline-block h-2 w-2 rounded-sm bg-brand/70" /> views ·{" "}
            <span className="mr-1 inline-block h-2 w-2 rounded-sm bg-accent" /> ad clicks ·{" "}
            <span className="mr-1 inline-block h-2 w-2 rounded-sm bg-emerald-500/80" /> contact clicks
            · last 14 days
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-6">
        <BusinessForm action={updateBusinessAction} business={business} />
      </section>

      <MediaManager
        businessId={business.id}
        logoPath={business.logoPath}
        photoPaths={business.photoPaths}
        videoPath={business.videoPath}
        videoPosterPath={business.videoPosterPath}
        bannerPath={business.bannerPath}
      />

      <details className="rounded-2xl border border-rose-200 bg-surface p-5">
        <summary className="cursor-pointer text-sm font-medium text-rose-700">Delete this business</summary>
        <p className="mt-3 text-sm text-muted">
          Removes the listing from the database. Uploaded media stays in the storage bucket — delete it
          from the Media section first if you want it gone.
        </p>
        <form action={deleteBusinessAction} className="mt-4">
          <input type="hidden" name="id" value={business.id} />
          <button
            type="submit"
            className="rounded-full border border-brand px-5 py-2 text-sm font-medium text-brand hover:bg-brand hover:text-white"
          >
            Delete permanently
          </button>
        </form>
      </details>
    </div>
  );
}

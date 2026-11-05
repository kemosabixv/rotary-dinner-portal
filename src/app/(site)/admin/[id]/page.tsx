import Link from "next/link";
import { notFound } from "next/navigation";
import { BusinessForm } from "@/components/BusinessForm";
import { MediaManager } from "@/components/MediaManager";
import { deleteBusinessAction, updateBusinessAction } from "@/lib/actions/businesses";
import { getBusinessById } from "@/lib/data";

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

      <section className="rounded-2xl border border-line bg-surface p-6">
        <BusinessForm action={updateBusinessAction} business={business} />
      </section>

      <MediaManager
        businessId={business.id}
        logoPath={business.logoPath}
        photoPaths={business.photoPaths}
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

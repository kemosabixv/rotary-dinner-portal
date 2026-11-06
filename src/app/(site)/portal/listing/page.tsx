import Link from "next/link";
import { redirect } from "next/navigation";
import { BusinessForm } from "@/components/BusinessForm";
import { MediaManager } from "@/components/MediaManager";
import { updateOwnBusinessAction } from "@/lib/actions/businesses";
import { getProfile } from "@/lib/auth";
import { getBusinessById } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Listing & media",
};

export default async function PortalListingPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; notice?: string }>;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/sign-in?next=/portal/listing");
  if (profile.role !== "business") redirect("/admin");
  if (!profile.businessId) redirect("/portal");

  const [{ saved, notice }, business] = await Promise.all([
    searchParams,
    getBusinessById(profile.businessId),
  ]);

  if (!business) redirect("/portal");

  return (
    <section className="mx-auto w-full max-w-5xl space-y-8 px-5 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/portal" className="text-sm text-muted hover:text-brand">
            ← My business
          </Link>
          <h1 className="mt-2 font-display text-3xl tracking-tight text-ink">
            Listing &amp; media
          </h1>
          <p className="mt-1 text-sm text-muted">
            /businesses/{business.slug} · updated{" "}
            {new Date(business.updatedAt).toLocaleString("en-KE")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/portal/polls"
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
      {notice && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {notice}
        </p>
      )}

      <p className="rounded-xl border border-line bg-paper/60 px-4 py-3 text-xs text-muted">
        Your package, payment status and whether the listing is live are handled by the dinner team.
        Everything else here is yours to edit.
      </p>

      <section className="rounded-2xl border border-line bg-surface p-6">
        <BusinessForm action={updateOwnBusinessAction} business={business} variant="owner" />
      </section>

      <MediaManager
        businessId={business.id}
        logoPath={business.logoPath}
        photoPaths={business.photoPaths}
        videoPath={business.videoPath}
        videoPosterPath={business.videoPosterPath}
        bannerPath={business.bannerPath}
      />
    </section>
  );
}

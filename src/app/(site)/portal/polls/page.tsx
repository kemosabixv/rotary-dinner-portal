import Link from "next/link";
import { redirect } from "next/navigation";
import { PollForm } from "@/components/PollForm";
import { PollList } from "@/components/PollList";
import { createPollAction } from "@/lib/actions/polls";
import { getProfile } from "@/lib/auth";
import { getBusinessById } from "@/lib/data";
import { countResponses, listPollsForBusiness } from "@/lib/polls";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Polls & quizzes",
};

export default async function PortalPollsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/sign-in?next=/portal/polls");
  if (profile.role !== "business") redirect("/admin");
  if (!profile.businessId) redirect("/portal");

  const [{ notice }, business] = await Promise.all([
    searchParams,
    getBusinessById(profile.businessId),
  ]);

  const polls = await listPollsForBusiness(profile.businessId);
  const counts = await countResponses(polls.map((poll) => poll.id));

  return (
    <section className="mx-auto w-full max-w-5xl space-y-8 px-5 py-12">
      <div>
        <Link href="/portal" className="text-sm text-muted hover:text-brand">
          ← My business
        </Link>
        <h1 className="mt-2 font-display text-3xl tracking-tight text-ink">Polls &amp; quizzes</h1>
        <p className="mt-1 text-sm text-muted">
          Ask your customers a few questions, hand out a discount code in return, and read every
          response as it arrives.
        </p>
      </div>

      {notice && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {notice}
        </p>
      )}

      <PollList
        polls={polls}
        counts={counts}
        basePath="/portal/polls"
        businessId={profile.businessId}
        emptyText="No polls yet. Create one below."
      />

      <details className="rounded-2xl border border-line bg-surface p-5">
        <summary className="cursor-pointer text-sm font-medium text-brand">+ Create a poll</summary>

        <div className="mt-6">
          <PollForm
            action={createPollAction}
            businessId={profile.businessId}
            defaultCouponPrefix={(business?.name ?? "DINNER").split(" ")[0].toUpperCase()}
            submitLabel="Create poll"
          />
        </div>
      </details>
    </section>
  );
}

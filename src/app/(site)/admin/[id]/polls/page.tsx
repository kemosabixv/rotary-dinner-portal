import Link from "next/link";
import { notFound } from "next/navigation";
import { PollForm } from "@/components/PollForm";
import { PollList } from "@/components/PollList";
import { createPollAction } from "@/lib/actions/polls";
import { getBusinessById } from "@/lib/data";
import { countResponses, listPollsForBusiness } from "@/lib/polls";

export const dynamic = "force-dynamic";

export default async function BusinessPollsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const [{ id }, { notice }] = await Promise.all([params, searchParams]);
  const business = await getBusinessById(id);
  if (!business) notFound();

  const polls = await listPollsForBusiness(id);
  const counts = await countResponses(polls.map((poll) => poll.id));

  return (
    <div className="space-y-8">
      <div>
        <Link href={`/admin/${business.id}`} className="text-sm text-muted hover:text-brand">
          ← {business.name}
        </Link>
        <h1 className="mt-2 font-display text-2xl text-ink">Polls &amp; quizzes</h1>
        <p className="mt-1 text-sm text-muted">
          The add-on product: 5–10 questions, a coupon for the respondent, and an export of the
          answers for the business.
        </p>
      </div>

      {notice && (
        <p className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink">{notice}</p>
      )}

      <PollList
        polls={polls}
        counts={counts}
        basePath="/admin/polls"
        businessId={business.id}
        emptyText="No polls yet for this business."
      />

      <details className="rounded-2xl border border-line bg-surface p-5">
        <summary className="cursor-pointer text-sm font-medium text-brand">+ Create a poll</summary>

        <div className="mt-6">
          <PollForm
            action={createPollAction}
            businessId={business.id}
            defaultCouponPrefix={business.name.split(" ")[0].toUpperCase()}
            submitLabel="Create poll"
          />
        </div>
      </details>
    </div>
  );
}

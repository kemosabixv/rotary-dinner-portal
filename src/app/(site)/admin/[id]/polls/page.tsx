import Link from "next/link";
import { notFound } from "next/navigation";
import { PollQuestionsEditor } from "@/components/PollQuestionsEditor";
import { createPollAction, setPollStatusAction } from "@/lib/actions/polls";
import { getBusinessById } from "@/lib/data";
import { listPollsForBusiness } from "@/lib/polls";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  live: "bg-emerald-50 text-emerald-700 border-emerald-200",
  draft: "bg-slate-50 text-slate-600 border-slate-200",
  closed: "bg-stone-100 text-stone-500 border-stone-200",
};

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

      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-paper text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Poll</th>
              <th className="px-4 py-3 font-medium">Questions</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {polls.map((poll) => (
              <tr key={poll.id}>
                <td className="px-4 py-3">
                  <Link href={`/admin/polls/${poll.id}`} className="font-medium text-ink hover:text-brand">
                    {poll.title}
                  </Link>
                  <p className="text-xs text-muted">/polls/{poll.slug}</p>
                </td>
                <td className="px-4 py-3 text-muted">{poll.questions.length}</td>
                <td className="px-4 py-3">
                  <form action={setPollStatusAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={poll.id} />
                    <input type="hidden" name="businessId" value={business.id} />
                    <select
                      name="status"
                      defaultValue={poll.status}
                      className={`rounded-full border px-2.5 py-1 text-xs ${statusStyles[poll.status]}`}
                    >
                      <option value="draft">draft</option>
                      <option value="live">live</option>
                      <option value="closed">closed</option>
                    </select>
                    <button type="submit" className="text-xs text-brand hover:text-brand-ink">
                      set
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/polls/${poll.id}`} className="text-xs text-brand hover:text-brand-ink">
                    Edit / responses
                  </Link>
                </td>
              </tr>
            ))}
            {polls.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-muted">
                  No polls yet for this business.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <details className="rounded-2xl border border-line bg-surface p-5">
        <summary className="cursor-pointer text-sm font-medium text-brand">+ Create a poll</summary>

        <form action={createPollAction} className="mt-6 space-y-5">
          <input type="hidden" name="businessId" value={business.id} />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-ink">
              Title
              <input
                name="title"
                required
                placeholder="What do you buy most often?"
                className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand"
              />
            </label>
            <label className="block text-sm font-medium text-ink">
              Coupon prefix
              <input
                name="couponPrefix"
                defaultValue={business.name.split(" ")[0].toUpperCase()}
                className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand"
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-ink">
            Intro
            <textarea
              name="intro"
              rows={2}
              placeholder="Three questions, thirty seconds — and a discount code at the end."
              className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>

          <label className="block text-sm font-medium text-ink">
            Coupon the respondent receives (leave blank for no coupon)
            <input
              name="couponLabel"
              placeholder="10% off your first order"
              className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>

          <div>
            <p className="text-sm font-medium text-ink">Questions</p>
            <div className="mt-2">
              <PollQuestionsEditor />
            </div>
          </div>

          <button
            type="submit"
            className="rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-ink"
          >
            Create poll
          </button>
        </form>
      </details>
    </div>
  );
}

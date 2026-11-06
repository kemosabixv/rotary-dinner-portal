import Link from "next/link";
import { notFound } from "next/navigation";
import { PollForm } from "@/components/PollForm";
import { PollResponses } from "@/components/PollResponses";
import { PollStatusControl } from "@/components/PollStatusControl";
import { deletePollAction, updatePollAction } from "@/lib/actions/polls";
import { getBusinessById } from "@/lib/data";
import { getPoll, listResponses } from "@/lib/polls";

export const dynamic = "force-dynamic";

export default async function PollAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ pollId: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ pollId }, { saved }] = await Promise.all([params, searchParams]);
  const poll = await getPoll(pollId);
  if (!poll) notFound();

  const [business, responses] = await Promise.all([
    getBusinessById(poll.businessId),
    listResponses(poll.id),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={`/admin/${poll.businessId}/polls`}
            className="text-sm text-muted hover:text-brand"
          >
            ← Polls for {business?.name ?? "this business"}
          </Link>
          <h1 className="mt-2 font-display text-2xl text-ink">{poll.title}</h1>
          <p className="text-sm text-muted">
            /polls/{poll.slug} · {poll.questions.length} questions · {responses.length} responses
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {poll.status === "live" && (
            <Link
              href={`/polls/${poll.slug}`}
              className="rounded-full border border-line px-4 py-2 text-sm text-muted hover:border-brand hover:text-brand"
            >
              Open public poll
            </Link>
          )}
          <a
            href={`/admin/polls/${poll.id}/export`}
            className="rounded-full border border-line px-4 py-2 text-sm text-muted hover:border-brand hover:text-brand"
          >
            Export CSV
          </a>
        </div>
      </div>

      {saved && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Saved.
        </p>
      )}

      <PollStatusControl poll={poll} />

      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-display text-lg text-ink">Edit poll</h2>
        <div className="mt-5">
          <PollForm
            action={updatePollAction}
            businessId={poll.businessId}
            poll={poll}
            submitLabel="Save poll"
            responseCount={responses.length}
          />
        </div>
      </section>

      <PollResponses poll={poll} responses={responses} />

      <details className="rounded-2xl border border-rose-200 bg-surface p-5">
        <summary className="cursor-pointer text-sm font-medium text-rose-700">Delete this poll</summary>
        <p className="mt-3 text-sm text-muted">
          Deletes the poll, its questions and all {responses.length} responses. Export first if you
          need the data.
        </p>
        <form action={deletePollAction} className="mt-4">
          <input type="hidden" name="id" value={poll.id} />
          <input type="hidden" name="businessId" value={poll.businessId} />
          <button
            type="submit"
            className="rounded-full border border-rose-300 px-5 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
          >
            Delete permanently
          </button>
        </form>
      </details>
    </div>
  );
}

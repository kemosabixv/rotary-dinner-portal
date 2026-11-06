import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PollForm } from "@/components/PollForm";
import { PollResponses } from "@/components/PollResponses";
import { PollStatusControl } from "@/components/PollStatusControl";
import { deletePollAction, updatePollAction } from "@/lib/actions/polls";
import { canWriteBusiness, getProfile } from "@/lib/auth";
import { getPoll, listResponses } from "@/lib/polls";

export const dynamic = "force-dynamic";

export default async function PortalPollPage({
  params,
  searchParams,
}: {
  params: Promise<{ pollId: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/sign-in?next=/portal");
  if (profile.role !== "business") redirect("/admin");
  if (!profile.businessId) redirect("/portal");

  const [{ pollId }, { saved }] = await Promise.all([params, searchParams]);
  const poll = await getPoll(pollId);

  // A business may only open polls that belong to its own listing.
  if (!poll || poll.businessId !== profile.businessId) notFound();

  const responses = await listResponses(poll.id);
  const canWrite = canWriteBusiness(profile);

  return (
    <section className="mx-auto w-full max-w-5xl space-y-8 px-5 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/portal/polls" className="text-sm text-muted hover:text-brand">
            ← Polls &amp; quizzes
          </Link>
          <h1 className="mt-2 font-display text-3xl tracking-tight text-ink">{poll.title}</h1>
          <p className="mt-1 text-sm text-muted">
            /polls/{poll.slug} · {poll.questions.length} questions · {responses.length}{" "}
            {responses.length === 1 ? "response" : "responses"}
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
            href={`/portal/polls/${poll.id}/export`}
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

      <PollStatusControl poll={poll} canWrite={canWrite} />

      {canWrite && (
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
      )}

      <PollResponses poll={poll} responses={responses} />

      {canWrite && (
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
      )}
    </section>
  );
}

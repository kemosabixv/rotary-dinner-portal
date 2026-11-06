import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PollQuestionsEditor } from "@/components/PollQuestionsEditor";
import { deletePollAction, setPollStatusAction, updatePollAction } from "@/lib/actions/polls";
import { getProfile } from "@/lib/auth";
import { getPoll, listResponses } from "@/lib/polls";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  live: "bg-emerald-50 text-emerald-700 border-emerald-200",
  draft: "bg-slate-50 text-slate-600 border-slate-200",
  closed: "bg-stone-100 text-stone-500 border-stone-200",
};

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

  return (
    <section className="mx-auto w-full max-w-5xl space-y-8 px-5 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/portal" className="text-sm text-muted hover:text-brand">
            ← My business
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

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface p-4">
        <span className={`rounded-full border px-3 py-1 text-xs ${statusStyles[poll.status]}`}>
          {poll.status}
        </span>
        <form action={setPollStatusAction} className="flex items-center gap-2">
          <input type="hidden" name="id" value={poll.id} />
          <input type="hidden" name="businessId" value={poll.businessId} />
          <select
            name="status"
            defaultValue={poll.status}
            className="rounded-full border border-line px-3 py-1.5 text-xs"
          >
            <option value="draft">draft</option>
            <option value="live">live</option>
            <option value="closed">closed</option>
          </select>
          <button type="submit" className="text-xs text-brand hover:text-brand-ink">
            Update status
          </button>
        </form>
        <span className="text-xs text-muted">
          Only a <strong>live</strong> poll is visible to the public and accepts responses.
        </span>
      </div>

      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-display text-lg text-ink">Edit poll</h2>
        <form action={updatePollAction} className="mt-5 space-y-5">
          <input type="hidden" name="id" value={poll.id} />
          <input type="hidden" name="businessId" value={poll.businessId} />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-ink">
              Title
              <input
                name="title"
                required
                defaultValue={poll.title}
                className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand"
              />
            </label>
            <label className="block text-sm font-medium text-ink">
              Coupon prefix
              <input
                name="couponPrefix"
                defaultValue={poll.couponPrefix}
                className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand"
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-ink">
            Intro
            <textarea
              name="intro"
              rows={2}
              defaultValue={poll.intro}
              className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>

          <label className="block text-sm font-medium text-ink">
            Coupon the respondent receives
            <input
              name="couponLabel"
              defaultValue={poll.couponLabel ?? ""}
              placeholder="10% off your first order"
              className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>

          <div>
            <p className="text-sm font-medium text-ink">Questions</p>
            {responses.length > 0 && (
              <p className="mt-1 text-xs text-amber-700">
                This poll already has {responses.length}{" "}
                {responses.length === 1 ? "response" : "responses"}. Changing the questions only
                affects future respondents — export first if you need the current answers.
              </p>
            )}
            <div className="mt-2">
              <PollQuestionsEditor
                initial={poll.questions.map((question) => ({
                  prompt: question.prompt,
                  kind: question.kind,
                  options: question.options,
                  required: question.required,
                }))}
              />
            </div>
          </div>

          <button
            type="submit"
            className="rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-ink"
          >
            Save poll
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-lg text-ink">Responses</h2>
          <p className="text-xs text-muted">
            {responses.length === 0 ? "No responses yet." : "Export CSV for the full set."}
          </p>
        </div>

        {responses.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="py-2 pr-4 font-medium">When</th>
                  <th className="py-2 pr-4 font-medium">Name</th>
                  <th className="py-2 pr-4 font-medium">Email</th>
                  <th className="py-2 pr-4 font-medium">Phone</th>
                  <th className="py-2 pr-4 font-medium">Coupon</th>
                  <th className="py-2 pr-4 font-medium">Emailed</th>
                  <th className="py-2 font-medium">Answers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {responses.slice(0, 50).map((response) => (
                  <tr key={response.id} className="align-top">
                    <td className="py-2 pr-4 text-muted">
                      {new Date(response.createdAt).toLocaleString("en-KE")}
                    </td>
                    <td className="py-2 pr-4">{response.respondentName ?? "—"}</td>
                    <td className="py-2 pr-4 text-muted">{response.respondentEmail ?? "—"}</td>
                    <td className="py-2 pr-4 text-muted">{response.respondentContact ?? "—"}</td>
                    <td className="py-2 pr-4 font-mono text-xs">{response.couponCode ?? "—"}</td>
                    <td className="py-2 pr-4 text-xs text-muted">
                      {response.couponEmailStatus ?? "—"}
                    </td>
                    <td className="py-2 text-xs text-muted">
                      {poll.questions
                        .map((question) => {
                          const answer = response.answers[question.id];
                          return answer ? `${question.prompt.slice(0, 28)}: ${answer}` : null;
                        })
                        .filter(Boolean)
                        .join(" · ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {responses.length > 50 && (
              <p className="mt-3 text-xs text-muted">
                Showing the latest 50 of {responses.length} — export for the full set.
              </p>
            )}
          </div>
        )}
      </section>

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
    </section>
  );
}

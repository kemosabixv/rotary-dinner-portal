import type { Poll, PollResponse } from "@/lib/types";

const VISIBLE_LIMIT = 50;

/** Response table for one poll. Identical for staff and businesses. */
export function PollResponses({
  poll,
  responses,
}: {
  poll: Poll;
  responses: PollResponse[];
}) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-lg text-ink">Responses</h2>
        <p className="text-xs text-muted">
          {responses.length === 0
            ? "No responses yet."
            : `Latest ${Math.min(VISIBLE_LIMIT, responses.length)} of ${responses.length} — export CSV for the full set.`}
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
              {responses.slice(0, VISIBLE_LIMIT).map((response) => (
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
                        return answer ? `${question.prompt}: ${answer}` : null;
                      })
                      .filter(Boolean)
                      .join(" · ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {responses.length > VISIBLE_LIMIT && (
            <p className="mt-3 text-xs text-muted">
              Showing the latest {VISIBLE_LIMIT} of {responses.length} — export for the full set.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

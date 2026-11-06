import Link from "next/link";
import { POLL_STATUS_STYLES } from "@/components/PollStatusControl";
import { setPollStatusAction } from "@/lib/actions/polls";
import type { Poll } from "@/lib/types";

/** Poll table with an inline status switch. Used by staff and businesses. */
export function PollList({
  polls,
  counts,
  basePath,
  businessId,
  emptyText,
  canWrite = true,
}: {
  polls: Poll[];
  counts: Record<string, number>;
  basePath: string;
  businessId: string;
  emptyText: string;
  canWrite?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <table className="w-full text-left text-sm">
        <thead className="bg-paper text-xs uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Poll</th>
            <th className="px-4 py-3 font-medium">Questions</th>
            <th className="px-4 py-3 font-medium">Responses</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {polls.map((poll) => (
            <tr key={poll.id}>
              <td className="px-4 py-3">
                <Link href={`${basePath}/${poll.id}`} className="font-medium text-ink hover:text-brand">
                  {poll.title}
                </Link>
                <p className="text-xs text-muted">/polls/{poll.slug}</p>
              </td>
              <td className="px-4 py-3 text-muted">{poll.questions.length}</td>
              <td className="px-4 py-3 text-muted">{counts[poll.id] ?? 0}</td>
              <td className="px-4 py-3">
                {canWrite ? (
                  <form action={setPollStatusAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={poll.id} />
                    <input type="hidden" name="businessId" value={businessId} />
                    <select
                      name="status"
                      defaultValue={poll.status}
                      className={`rounded-full border px-2.5 py-1 text-xs ${POLL_STATUS_STYLES[poll.status]}`}
                    >
                      <option value="draft">draft</option>
                      <option value="live">live</option>
                      <option value="closed">closed</option>
                    </select>
                    <button type="submit" className="text-xs text-brand hover:text-brand-ink">
                      set
                    </button>
                  </form>
                ) : (
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs ${POLL_STATUS_STYLES[poll.status]}`}
                  >
                    {poll.status}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`${basePath}/${poll.id}`}
                  className="text-xs text-brand hover:text-brand-ink"
                >
                  {canWrite ? "Edit / responses" : "View responses"}
                </Link>
              </td>
            </tr>
          ))}
          {polls.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted">
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

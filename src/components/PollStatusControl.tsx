import { setPollStatusAction } from "@/lib/actions/polls";
import type { Poll } from "@/lib/types";

export const POLL_STATUS_STYLES: Record<string, string> = {
  live: "bg-emerald-50 text-emerald-700 border-emerald-200",
  draft: "bg-slate-50 text-slate-600 border-slate-200",
  closed: "bg-stone-100 text-stone-500 border-stone-200",
};

/** Draft / live / closed switch. Identical for staff and businesses. */
export function PollStatusControl({ poll, canWrite = true }: { poll: Poll; canWrite?: boolean }) {
  if (!canWrite) {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface p-4">
        <span className={`rounded-full border px-3 py-1 text-xs ${POLL_STATUS_STYLES[poll.status]}`}>
          {poll.status}
        </span>
        <span className="text-xs text-muted">
          Read-only access — the owner or an editor can change the status.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface p-4">
      <span
        className={`rounded-full border px-3 py-1 text-xs ${POLL_STATUS_STYLES[poll.status]}`}
      >
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
  );
}

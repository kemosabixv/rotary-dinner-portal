import { PollQuestionsEditor } from "@/components/PollQuestionsEditor";
import type { Poll } from "@/lib/types";

/**
 * Create/edit form for a poll. Used unchanged by staff and by businesses,
 * so both get the same fields, validation and behaviour.
 */
export function PollForm({
  action,
  businessId,
  poll,
  defaultCouponPrefix = "DINNER",
  submitLabel,
  responseCount = 0,
}: {
  action: (formData: FormData) => void | Promise<void>;
  businessId: string;
  poll?: Poll;
  defaultCouponPrefix?: string;
  submitLabel: string;
  responseCount?: number;
}) {
  return (
    <form action={action} className="space-y-5">
      {poll && <input type="hidden" name="id" value={poll.id} />}
      <input type="hidden" name="businessId" value={businessId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-ink">
          Title
          <input
            name="title"
            required
            defaultValue={poll?.title ?? ""}
            placeholder="What do you buy most often?"
            className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand"
          />
        </label>
        <label className="block text-sm font-medium text-ink">
          Coupon prefix
          <input
            name="couponPrefix"
            defaultValue={poll?.couponPrefix ?? defaultCouponPrefix}
            className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand"
          />
        </label>
      </div>

      <label className="block text-sm font-medium text-ink">
        Intro
        <textarea
          name="intro"
          rows={2}
          defaultValue={poll?.intro ?? ""}
          placeholder="Three questions, thirty seconds — and a discount code at the end."
          className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand"
        />
      </label>

      <label className="block text-sm font-medium text-ink">
        Coupon the respondent receives (leave blank for no coupon)
        <input
          name="couponLabel"
          defaultValue={poll?.couponLabel ?? ""}
          placeholder="10% off your first order"
          className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand"
        />
      </label>

      <div>
        <p className="text-sm font-medium text-ink">Questions</p>
        {responseCount > 0 && (
          <p className="mt-1 text-xs text-amber-700">
            This poll already has {responseCount}{" "}
            {responseCount === 1 ? "response" : "responses"}. Changing the questions only affects
            future respondents — export first if you need the current answers.
          </p>
        )}
        <div className="mt-2">
          <PollQuestionsEditor
            initial={
              poll?.questions.map((question) => ({
                prompt: question.prompt,
                kind: question.kind,
                options: question.options,
                required: question.required,
              })) ?? []
            }
          />
        </div>
      </div>

      <button
        type="submit"
        className="rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-ink"
      >
        {submitLabel}
      </button>
    </form>
  );
}

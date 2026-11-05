import Link from "next/link";
import { notFound } from "next/navigation";
import { submitPollResponseAction } from "@/lib/actions/polls";
import { getBusinessById } from "@/lib/data";
import { getLivePollBySlug } from "@/lib/polls";

export const dynamic = "force-dynamic";

export default async function PublicPollPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ code?: string; thanks?: string; error?: string; emailed?: string }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const poll = await getLivePollBySlug(slug);
  if (!poll) notFound();

  const business = await getBusinessById(poll.businessId);
  const submitted = query.thanks === "1";
  const coupon = query.code && query.code !== "1" ? query.code : null;
  const emailed = query.emailed === "1";
  const emailFailed = query.emailed === "0";

  return (
    <section className="mx-auto w-full max-w-2xl px-5 py-14">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
        {business?.name ?? "Partner poll"}
      </p>
      <h1 className="mt-3 font-display text-3xl leading-tight tracking-tight text-ink sm:text-4xl">
        {poll.title}
      </h1>
      {poll.intro && <p className="mt-3 text-base leading-relaxed text-muted">{poll.intro}</p>}

      {submitted ? (
        <div className="mt-8 rounded-3xl border border-line bg-surface p-7">
          <h2 className="font-display text-xl text-ink">Thank you</h2>

          {coupon ? (
            <>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {emailed
                  ? "We've emailed your code. You can also save it from here:"
                  : emailFailed
                    ? "We couldn't email the code — save it from here and show it to the business."
                    : "Email delivery is not configured yet — save this code now."}
              </p>
              <p className="mt-4 rounded-xl border border-dashed border-brand/40 bg-brand-soft/50 px-5 py-4 text-center font-mono text-2xl tracking-[0.18em] text-brand">
                {coupon}
              </p>
              <p className="mt-3 text-sm text-ink">{poll.couponLabel}</p>
              <p className="mt-1 text-xs text-muted">
                Show this code to {business?.name ?? "the business"}. One use per respondent.
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted">
              Your answers have been recorded. Thank you for taking part.
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/businesses/${business?.slug ?? ""}`}
              className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-ink"
            >
              Visit {business?.name ?? "the business"}
            </Link>
            <Link
              href="/businesses"
              className="rounded-full border border-line px-5 py-2.5 text-sm text-muted hover:border-brand hover:text-brand"
            >
              All businesses
            </Link>
          </div>
        </div>
      ) : (
        <form action={submitPollResponseAction} className="mt-8 space-y-4">
          <input type="hidden" name="slug" value={poll.slug} />
          {/* Honeypot: bots fill every field; humans never see it. */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute left-[-9999px] h-0 w-0 opacity-0"
          />

          {query.error && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {query.error}
            </p>
          )}

          {poll.questions.map((question, index) => (
            <div key={question.id} className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-relaxed text-ink">
                    {question.prompt}
                    {!question.required && (
                      <span className="ml-1 text-xs font-normal text-muted">(optional)</span>
                    )}
                  </p>

                  {question.kind === "choice" ? (
                    <div className="mt-3 space-y-2">
                      {question.options.map((option) => (
                        <label
                          key={option}
                          className="flex cursor-pointer items-center gap-3 rounded-xl border border-line px-3.5 py-2.5 text-sm transition-colors hover:border-brand/50 hover:bg-brand-soft/30"
                        >
                          <input
                            type="radio"
                            name={`q_${question.id}`}
                            value={option}
                            required={question.required}
                            className="h-4 w-4 shrink-0"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      name={`q_${question.id}`}
                      rows={3}
                      required={question.required}
                      maxLength={500}
                      className="mt-3 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="rounded-2xl border border-line bg-surface p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-ink">
                Your name <span className="text-xs font-normal text-muted">(optional)</span>
                <input
                  name="name"
                  className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand"
                />
              </label>
              <label className="block text-sm font-medium text-ink">
                Email{" "}
                <span className="text-xs font-normal text-muted">
                  {poll.couponLabel ? "(for your code)" : "(optional)"}
                </span>
                <input
                  type="email"
                  name="email"
                  required={Boolean(poll.couponLabel)}
                  autoComplete="email"
                  className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand"
                />
              </label>
              <label className="block text-sm font-medium text-ink sm:col-span-2">
                Phone <span className="text-xs font-normal text-muted">(optional)</span>
                <input
                  name="contact"
                  className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand"
                />
              </label>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-muted">
              Your answers go to {business?.name ?? "the business"}.{" "}
              {poll.couponLabel
                ? "Your email is used only to send the code."
                : "We do not share your contact details with anyone else."}
            </p>
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-brand px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-ink sm:w-auto"
          >
            {poll.couponLabel ? "Submit and email my code" : "Submit answers"}
          </button>
        </form>
      )}
    </section>
  );
}

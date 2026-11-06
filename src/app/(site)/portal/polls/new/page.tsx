import Link from "next/link";
import { redirect } from "next/navigation";
import { PollQuestionsEditor } from "@/components/PollQuestionsEditor";
import { createPollAction } from "@/lib/actions/polls";
import { getProfile } from "@/lib/auth";
import { getBusinessById } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "New poll",
};

export default async function NewPollPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/sign-in?next=/portal/polls/new");
  if (profile.role !== "business") redirect("/admin");
  if (!profile.businessId) redirect("/portal");

  const [{ notice }, business] = await Promise.all([
    searchParams,
    getBusinessById(profile.businessId),
  ]);

  return (
    <section className="mx-auto w-full max-w-3xl space-y-8 px-5 py-12">
      <div>
        <Link href="/portal" className="text-sm text-muted hover:text-brand">
          ← My business
        </Link>
        <h1 className="mt-2 font-display text-3xl tracking-tight text-ink">New poll</h1>
        <p className="mt-1 text-sm text-muted">
          Ask your customers a few questions and hand out a discount code in return. Polls start as
          a draft — publish when you&apos;re ready.
        </p>
      </div>

      {notice && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {notice}
        </p>
      )}

      <form action={createPollAction} className="space-y-5 rounded-2xl border border-line bg-surface p-6">
        <input type="hidden" name="businessId" value={business?.id ?? profile.businessId} />

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
              defaultValue={(business?.name ?? "DINNER").split(" ")[0].toUpperCase()}
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
    </section>
  );
}

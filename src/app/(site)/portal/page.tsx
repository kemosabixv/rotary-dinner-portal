import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/actions/auth";
import { getProfile, homeFor } from "@/lib/auth";
import { getBusinessById } from "@/lib/data";
import { getBusinessMetrics } from "@/lib/metrics";
import { listPaymentsForBusiness } from "@/lib/payments";
import { listPollsForBusiness, listResponses } from "@/lib/polls";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My business",
};

const PACKAGE_LABELS: Record<string, string> = {
  basic_5k: "Community listing",
  premium_10k: "Featured partner",
  sponsor: "Sponsor",
  comp: "Complimentary",
};

export default async function PortalPage() {
  const profile = await getProfile();
  if (!profile) redirect("/sign-in?next=/portal");
  if (profile.role !== "business") redirect(homeFor(profile.role));

  if (!profile.businessId) {
    return (
      <section className="mx-auto w-full max-w-2xl px-5 py-16">
        <h1 className="font-display text-3xl text-ink">Your account isn&apos;t linked yet</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Signed in as <span className="text-ink">{profile.email}</span>. Once your package is
          confirmed, the dinner team links your account to your listing and this page fills up with
          your views, clicks, polls and coupons.
        </p>
        <p className="mt-4 text-sm text-muted">
          Send your payment reference to the dinner team if you haven&apos;t already.
        </p>
        <Link
          href="/advertise"
          className="mt-6 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-medium text-white hover:bg-brand-ink"
        >
          See the packages
        </Link>
      </section>
    );
  }

  const business = await getBusinessById(profile.businessId);
  if (!business) redirect("/portal");

  const [{ totals, daily }, polls, payments] = await Promise.all([
    getBusinessMetrics(business.id),
    listPollsForBusiness(business.id),
    listPaymentsForBusiness(business.id),
  ]);

  const maxDaily = Math.max(1, ...daily.map((entry) => entry.impressions + entry.clicks));
  const responsesByPoll = await Promise.all(
    polls.map(async (poll) => ({ poll, responses: await listResponses(poll.id) })),
  );

  return (
    <section className="mx-auto w-full max-w-5xl space-y-8 px-5 py-12">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">My business</p>
          <h1 className="mt-1 font-display text-3xl tracking-tight text-ink">{business.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {PACKAGE_LABELS[business.packageTier] ?? business.packageTier} ·{" "}
            <span className="text-ink">{business.paidStatus === "paid" ? "paid" : business.paidStatus}</span>{" "}
            · listing {business.status}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {business.status === "live" && (
            <Link
              href={`/businesses/${business.slug}`}
              className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-ink"
            >
              View my listing
            </Link>
          )}
          <Link
            href="/advertise"
            className="rounded-full border border-line px-5 py-2.5 text-sm text-muted hover:border-brand hover:text-brand"
          >
            Packages
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-full border border-line px-5 py-2.5 text-sm text-muted hover:border-brand hover:text-brand"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <section className="rounded-2xl border border-line bg-surface p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-lg text-ink">Views &amp; clicks</h2>
          <p className="text-xs text-muted">
            {totals.impressions} views · {totals.clicks} clicks all time
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Views (7d)", value: totals.impressions7d },
            { label: "Clicks (7d)", value: totals.clicks7d },
            { label: "Views (all time)", value: totals.impressions },
            { label: "Clicks (all time)", value: totals.clicks },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-line bg-paper/60 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{stat.label}</p>
              <p className="mt-1 font-display text-2xl text-ink">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <div className="flex h-24 items-end gap-1.5">
            {daily.map((entry) => (
              <div
                key={entry.day}
                className="flex h-full flex-1 flex-col justify-end gap-0.5"
                title={`${entry.day}: ${entry.impressions} views, ${entry.clicks} clicks`}
              >
                <div
                  className="w-full rounded-t bg-brand/70"
                  style={{ height: `${Math.round((entry.impressions / maxDaily) * 100)}%` }}
                />
                <div
                  className="w-full rounded-t bg-accent"
                  style={{ height: `${Math.round((entry.clicks / maxDaily) * 100)}%` }}
                />
              </div>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-muted">
            Last 14 days · blue = views, gold = clicks
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg text-ink">Polls &amp; coupons</h2>
          <Link
            href="/portal/polls/new"
            className="rounded-full border border-line px-4 py-2 text-xs text-muted hover:border-brand hover:text-brand"
          >
            + New poll
          </Link>
        </div>

        {polls.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            No polls yet. Ask the audience a few questions and hand out a discount code in return.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {responsesByPoll.map(({ poll, responses }) => (
              <li key={poll.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <Link
                    href={`/portal/polls/${poll.id}`}
                    className="font-medium text-ink hover:text-brand"
                  >
                    {poll.title}
                  </Link>
                  <p className="text-xs text-muted">
                    {poll.status} · {responses.length}{" "}
                    {responses.length === 1 ? "response" : "responses"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {poll.status === "live" && (
                    <Link
                      href={`/polls/${poll.slug}`}
                      className="text-xs text-muted hover:text-brand"
                    >
                      Public page
                    </Link>
                  )}
                  <Link
                    href={`/portal/polls/${poll.id}`}
                    className="text-xs font-medium text-brand hover:text-brand-ink"
                  >
                    Manage
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-display text-lg text-ink">Payments</h2>
        {payments.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            No payments recorded against your listing yet. If you paid by Paybill, the team will
            reconcile it manually.
          </p>
        ) : (
          <table className="mt-3 w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="py-2 pr-4 font-medium">Date</th>
                <th className="py-2 pr-4 font-medium">Reference</th>
                <th className="py-2 pr-4 font-medium">Amount</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="py-2 pr-4 text-muted">
                    {new Date(payment.createdAt).toLocaleDateString("en-KE")}
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs">{payment.reference}</td>
                  <td className="py-2 pr-4">KES {payment.amountKes.toLocaleString()}</td>
                  <td className="py-2">{payment.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </section>
  );
}

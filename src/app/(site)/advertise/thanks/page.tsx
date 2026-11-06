import Link from "next/link";
import { getProfile } from "@/lib/auth";
import { getPaymentStatus } from "@/lib/payments";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Payment",
};

const PACKAGE_LABELS: Record<string, string> = {
  basic_5k: "Community listing",
  premium_10k: "Featured partner",
  poll_quiz: "Audience poll or quiz (add-on)",
};

export default async function ThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  const [payment, profile] = await Promise.all([
    ref ? getPaymentStatus(ref) : Promise.resolve(null),
    getProfile(),
  ]);

  return (
    <section className="mx-auto w-full max-w-2xl px-5 py-16">
      {!payment ? (
        <div className="rounded-3xl border border-line bg-surface p-8 text-center">
          <h1 className="font-display text-3xl text-ink">We couldn&apos;t find that payment</h1>
          <p className="mt-3 text-sm text-muted">
            The link may be incomplete. If you were charged, send the reference from your M-Pesa or
            card message to the dinner team and they will match it up.
          </p>
          <Link
            href="/advertise"
            className="mt-6 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-medium text-white hover:bg-brand-ink"
          >
            Back to the packages
          </Link>
        </div>
      ) : payment.status === "paid" ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8">
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-700">Payment received</p>
          <h1 className="mt-3 font-display text-3xl text-ink">Thank you — you&apos;re in</h1>
          <dl className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Package</dt>
              <dd className="text-ink">{PACKAGE_LABELS[payment.package] ?? payment.package}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Amount</dt>
              <dd className="text-ink">KES {payment.amountKes.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Reference</dt>
              <dd className="font-mono text-xs text-ink">{payment.reference}</dd>
            </div>
            {payment.businessName && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Business</dt>
                <dd className="text-ink">{payment.businessName}</dd>
              </div>
            )}
          </dl>
          <p className="mt-6 text-sm text-muted">
            Next step: add your listing details so the dinner team can review and publish it.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {profile?.businessId ? (
              <Link
                href="/portal"
                className="rounded-full bg-brand px-6 py-3 text-sm font-medium text-white hover:bg-brand-ink"
              >
                Go to my portal
              </Link>
            ) : profile ? (
              <Link
                href={`/portal/create?ref=${encodeURIComponent(payment.reference)}`}
                className="rounded-full bg-brand px-6 py-3 text-sm font-medium text-white hover:bg-brand-ink"
              >
                Create your listing
              </Link>
            ) : (
              <Link
                href={`/sign-in?next=${encodeURIComponent(
                  `/portal/create?ref=${payment.reference}`,
                )}`}
                className="rounded-full bg-brand px-6 py-3 text-sm font-medium text-white hover:bg-brand-ink"
              >
                Sign in to create your listing
              </Link>
            )}
            <Link
              href="/advertise"
              className="rounded-full border border-line px-6 py-3 text-sm text-muted hover:border-brand hover:text-brand"
            >
              Back to the packages
            </Link>
          </div>
        </div>
      ) : payment.status === "failed" ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8">
          <h1 className="font-display text-3xl text-ink">That payment didn&apos;t go through</h1>
          <p className="mt-3 text-sm text-muted">
            Nothing was taken. Reference: <span className="font-mono text-xs">{payment.reference}</span>
          </p>
          <Link
            href={`/advertise/checkout?package=${payment.package}`}
            className="mt-6 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-medium text-white hover:bg-brand-ink"
          >
            Try again
          </Link>
        </div>
      ) : (
        <div className="rounded-3xl border border-line bg-surface p-8">
          <h1 className="font-display text-3xl text-ink">Processing your payment</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            M-Pesa and card confirmations can take a few seconds to arrive. This page updates on
            refresh — no need to pay again.
          </p>
          <p className="mt-4 text-sm">
            Reference: <span className="font-mono text-xs text-ink">{payment.reference}</span>
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/advertise/thanks?ref=${payment.reference}`}
              className="rounded-full bg-brand px-6 py-3 text-sm font-medium text-white hover:bg-brand-ink"
            >
              Check again
            </Link>
            <Link
              href="/advertise"
              className="rounded-full border border-line px-6 py-3 text-sm text-muted hover:border-brand hover:text-brand"
            >
              Back to the packages
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

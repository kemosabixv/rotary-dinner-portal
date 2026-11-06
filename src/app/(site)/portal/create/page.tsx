import Link from "next/link";
import { redirect } from "next/navigation";
import { BusinessForm } from "@/components/BusinessForm";
import { createOwnBusinessAction } from "@/lib/actions/listing";
import { getProfile } from "@/lib/auth";
import { listClaimablePayments } from "@/lib/payments";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Create your listing",
};

const PACKAGE_LABELS: Record<string, string> = {
  basic_5k: "Community listing",
  premium_10k: "Featured partner",
  sponsor: "Sponsor",
  comp: "Complimentary",
  poll_quiz: "Poll/quiz add-on",
};

export default async function CreateListingPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; error?: string }>;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/sign-in?next=/portal/create");
  if (profile.role !== "business") redirect("/admin");
  if (profile.businessId) redirect("/portal");

  const [{ ref, error }, payments] = await Promise.all([searchParams, listClaimablePayments()]);
  const selected = payments.find((payment) => payment.reference === ref) ?? null;

  return (
    <section className="mx-auto w-full max-w-3xl space-y-8 px-5 py-12">
      <div>
        <Link href="/portal" className="text-sm text-muted hover:text-brand">
          ← My business
        </Link>
        <h1 className="mt-2 font-display text-3xl tracking-tight text-ink">Create your listing</h1>
        <p className="mt-1 text-sm text-muted">
          Your package is paid. Add the details below and the dinner team will review and publish
          it. You can change any of this later.
        </p>
      </div>

      {error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      )}

      {payments.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="font-display text-lg text-ink">No paid package on this email yet</h2>
          <p className="mt-2 text-sm text-muted">
            We couldn&apos;t find a confirmed payment for {profile.email}. If you paid with a
            different email address, send the reference to the dinner team and they will link it.
          </p>
          <Link
            href="/advertise"
            className="mt-5 inline-flex rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-ink"
          >
            See the packages
          </Link>
        </div>
      ) : selected ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-emerald-700">Using payment</p>
              <p className="mt-1 text-sm text-ink">
                {PACKAGE_LABELS[selected.package] ?? selected.package} · KES{" "}
                {selected.amountKes.toLocaleString()}
              </p>
            </div>
            <p className="font-mono text-xs text-emerald-800">{selected.reference}</p>
          </div>

          <section className="rounded-2xl border border-line bg-surface p-6">
            <BusinessForm
              action={createOwnBusinessAction}
              variant="owner"
              hidden={{ paymentRef: selected.reference }}
              submitLabel="Create listing"
            />
          </section>
        </>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted">Pick the payment you want to use for this listing.</p>
          {payments.map((payment) => (
            <Link
              key={payment.reference}
              href={`/portal/create?ref=${encodeURIComponent(payment.reference)}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-3 hover:border-brand"
            >
              <div>
                <p className="text-sm font-medium text-ink">
                  {PACKAGE_LABELS[payment.package] ?? payment.package}
                </p>
                <p className="text-xs text-muted">
                  {payment.paidAt
                    ? new Date(payment.paidAt).toLocaleDateString("en-KE")
                    : "Paid"}{" "}
                  · KES {payment.amountKes.toLocaleString()}
                </p>
              </div>
              <span className="font-mono text-xs text-muted">{payment.reference}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

import Link from "next/link";
import packagesJson from "@/data/packages.json";
import type { PackagesConfig } from "@/lib/types";

const packages = packagesJson as PackagesConfig;
const hasPending = packages.tiers.some((tier) => tier.pending.length > 0);

export const metadata = {
  title: "Advertise with the dinner",
};

export default function AdvertisePage() {
  return (
    <>
      <section className="border-b border-line bg-gradient-to-b from-accent-soft/40 to-paper">
        <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:py-20">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand">
            Business partners
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl">
            Advertise to the district network — on the portal and at the dinner.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted">
            Two packages, both live through November and December. Create an account, pay online, and
            build your listing yourself — logo, photos, banner and an optional 30-second video. The
            dinner team reviews it before it goes live.
          </p>
        </div>
      </section>

      <section id="packages" className="mx-auto w-full max-w-6xl px-5 py-14">
        {hasPending && (
          <div className="mb-8 rounded-2xl border border-accent/40 bg-accent-soft/50 px-5 py-4 text-sm text-brand-ink">
            <strong className="font-medium">Draft pricing.</strong> Package contents marked “to be
            confirmed” are still being agreed by the dinner committee. Prices and inclusions may
            change before launch.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {packages.tiers.map((tier) => (
            <article
              key={tier.id}
              className={
                tier.featured
                  ? "relative flex flex-col rounded-3xl border-2 border-brand bg-surface p-7 shadow-[0_24px_60px_-40px_rgba(124,29,43,0.6)]"
                  : "relative flex flex-col rounded-3xl border border-line bg-surface p-7"
              }
            >
              {tier.featured && (
                <span className="absolute -top-3 left-7 rounded-full bg-brand px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-white">
                  Most visibility
                </span>
              )}

              <h2 className="font-display text-2xl text-ink">{tier.name}</h2>
              <p className="mt-1 text-sm text-muted">{tier.summary}</p>

              <p className="mt-5 font-display text-3xl text-brand">
                {tier.priceLabel}
                <span className="ml-1 text-sm font-normal text-muted">/ placement</span>
              </p>

              <ul className="mt-6 space-y-2.5 text-sm text-ink">
                {tier.includes.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {tier.pending.length > 0 && (
                <div className="mt-5 rounded-xl bg-paper px-4 py-3 text-xs text-muted">
                  <p className="font-medium text-brand-ink">To be confirmed</p>
                  <ul className="mt-1 space-y-0.5">
                    {tier.pending.map((item) => (
                      <li key={item}>· {item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-auto pt-6">
                <Link
                  href={`/advertise/checkout?package=${tier.id}`}
                  className="inline-flex rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-ink"
                >
                  Buy this package
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 rounded-3xl border border-line bg-paper p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-xl">
              <h2 className="font-display text-xl text-ink">
                {packages.addOn.name} — add-on
              </h2>
              <p className="mt-1 text-sm text-muted">{packages.addOn.summary}</p>
              <ul className="mt-4 space-y-1.5 text-sm text-ink">
                {packages.addOn.includes.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {packages.addOn.pending.length > 0 && (
                <p className="mt-4 text-xs text-muted">
                  Open questions: {packages.addOn.pending.join(" · ")}
                </p>
              )}
            </div>
            <p className="font-display text-2xl text-brand">
              + {packages.currency} {packages.addOn.priceKes?.toLocaleString()}
            </p>
            <Link
              href={`/advertise/checkout?package=${packages.addOn.id}`}
              className="inline-flex rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-ink"
            >
              Buy this add-on
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-surface/70">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl text-ink">How it works</h2>
            <ol className="mt-5 space-y-4 text-sm">
              <li>
                <p className="font-medium text-ink">1. Choose a package</p>
                <p className="text-muted">
                  Community listing at KES 5,000, Featured partner at KES 10,000, or add the
                  poll/quiz for KES 10,000.
                </p>
              </li>
              <li>
                <p className="font-medium text-ink">2. Create your account</p>
                <p className="text-muted">
                  Sign in with Google or email and password. Checkout, your listing and your
                  analytics all live in the same portal.
                </p>
              </li>
              <li>
                <p className="font-medium text-ink">3. Pay and add your details</p>
                <p className="text-muted">
                  Pay by M-Pesa or card, then build the listing yourself: description, services,
                  contact details, logo, photos, banner and an optional short video.
                </p>
              </li>
              <li>
                <p className="font-medium text-ink">4. Go live</p>
                <p className="text-muted">
                  The dinner team reviews it and publishes. Views, clicks, poll responses and coupons
                  appear in your portal from then on.
                </p>
              </li>
            </ol>
          </div>

          <div className="rounded-3xl border border-line bg-paper p-7">
            <h2 className="font-display text-2xl text-ink">Reserve a placement</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Packages are limited by carousel slots. Choose one and pay online — your listing goes
              live after a quick review.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/advertise#packages"
                className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-ink"
              >
                See the packages
              </Link>
              <Link
                href="/businesses"
                className="rounded-full border border-line px-5 py-2.5 text-sm text-muted transition-colors hover:border-brand hover:text-brand"
              >
                See live listings
              </Link>
            </div>
            <p className="mt-6 text-xs text-muted">
              Pay by M-Pesa or card at checkout. The district absorbs the transaction fee, so the
              full amount goes to the Rotary Foundation.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

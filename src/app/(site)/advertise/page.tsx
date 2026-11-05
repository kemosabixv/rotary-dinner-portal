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
            Two packages, both live through November and December. You send the words and the media;
            the dinner team publishes everything for you.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-14">
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
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-surface/70">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl text-ink">What we need from you</h2>
            <ol className="mt-5 space-y-4 text-sm">
              <li>
                <p className="font-medium text-ink">1. Your business details</p>
                <p className="text-muted">
                  Name, category, one-line description, longer description, the services you want
                  listed, and the contact details you are happy to publish.
                </p>
              </li>
              <li>
                <p className="font-medium text-ink">2. Your logo and photos</p>
                <p className="text-muted">
                  Send them by WhatsApp or email to the dinner team — a logo on a plain background,
                  plus up to four landscape photos. We resize everything for you.
                </p>
              </li>
              <li>
                <p className="font-medium text-ink">3. Confirmation of your package</p>
                <p className="text-muted">
                  Tell us which package you are taking and how you are paying. We publish as soon as
                  the details and media are in.
                </p>
              </li>
            </ol>
          </div>

          <div className="rounded-3xl border border-line bg-paper p-7">
            <h2 className="font-display text-2xl text-ink">Reserve a placement</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Packages are limited by carousel slots. Contact the dinner team through the district
              channels to confirm yours — and see what a finished listing looks like before you
              decide.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/businesses"
                className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-ink"
              >
                See live listings
              </Link>
              <Link
                href="/"
                className="rounded-full border border-line px-5 py-2.5 text-sm text-muted transition-colors hover:border-brand hover:text-brand"
              >
                Back to the dinner
              </Link>
            </div>
            <p className="mt-6 text-xs text-muted">
              Payment is by M-Pesa Paybill to the District 9215 TRF account. The team will confirm the
              paybill details with you directly — do not use numbers from old flyers.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

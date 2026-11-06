import Link from "next/link";
import { AdCarousel, type CarouselItem } from "@/components/AdCarousel";
import { BusinessCard } from "@/components/BusinessCard";
import { listLiveBusinessesPublic } from "@/lib/data";
import { bannerSource, effectiveBannerUrl, mediaUrl } from "@/lib/media";

export const revalidate = 60;

export default async function HomePage() {
  const businesses = await listLiveBusinessesPublic();

  const carouselItems: CarouselItem[] = businesses.map((business) => ({
    id: business.id,
    slug: business.slug,
    name: business.name,
    category: business.category,
    tagline: business.tagline,
    logoUrl: mediaUrl(business.logoPath),
    bannerUrl: effectiveBannerUrl(business),
    bannerFallback: bannerSource(business) === "photo",
  }));

  return (
    <>
      <section className="border-b border-line bg-gradient-to-b from-accent-soft/50 via-paper to-paper">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:py-24">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand">
            Rotary District 9215 · Foundation Dinner 2026
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-4xl leading-[1.05] tracking-tight text-ink sm:text-6xl">
            Put your business in front of the district.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            Advertising space for small businesses in the Rotary and Rotaract network — on the
            portal, on the dinner tables by QR code, and live through November and December.
            Launched at the Foundation Dinner on 21 November 2026 at the Trademark Hotel, Nairobi.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/advertise"
              className="rounded-full bg-brand px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-ink"
            >
              See the packages
            </Link>
            <Link
              href="/businesses"
              className="rounded-full border border-brand/30 px-6 py-3 text-sm font-medium text-brand transition-colors hover:border-brand hover:bg-white"
            >
              Browse the businesses
            </Link>
            <span className="text-sm text-muted">Packages from KES 5,000 · live through December</span>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl tracking-tight text-ink">On the night and in the room</h2>
            <p className="mt-1 text-sm text-muted">
              Partner ads rotate on the portal and are reachable from the dinner tables by QR code.
            </p>
          </div>
          <Link href="/businesses" className="text-sm text-brand hover:text-brand-ink">
            All businesses →
          </Link>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <AdCarousel items={carouselItems} />
          <div className="grid gap-4 sm:grid-cols-2">
            {businesses.slice(0, 2).map((business) => (
              <BusinessCard key={business.id} business={business} source="home" />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-surface/70">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-14 sm:grid-cols-3">
          {[
            {
              title: "The room",
              body: "Rotarians, Rotaractors, partners and guests from across District 9215 in one room for the Foundation Dinner.",
            },
            {
              title: "The portal",
              body: "A live directory of network businesses, reachable from every table by QR code and shared through district channels.",
            },
            {
              title: "The proof",
              body: "Every listing reports views, ad clicks and contact clicks, so you can see what the placement actually delivered.",
            },
          ].map((item) => (
            <div key={item.title}>
              <h3 className="font-display text-lg text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-14">
        <h2 className="font-display text-2xl tracking-tight text-ink">How it works</h2>
        <ol className="mt-6 grid gap-6 sm:grid-cols-4">
          {[
            ["Choose a package", "Community listing at KES 5,000, or Featured partner at KES 10,000 — with an optional poll add-on."],
            ["Create your account", "Sign in with Google or email. Checkout and your listing both live in your portal."],
            ["Pay and build", "Pay by M-Pesa or card, then add your details, logo, photos, banner and a short video."],
            ["Go live", "The team reviews it, your listing goes live, and views, clicks and poll results appear in your portal."],
          ].map(([title, body], index) => (
            <li key={title} className="rounded-2xl border border-line bg-surface p-5">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
                Step {index + 1}
              </span>
              <h3 className="mt-2 font-display text-base text-ink">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-6">
        <div className="rounded-3xl bg-brand px-8 py-12 text-white">
          <h2 className="max-w-2xl font-display text-3xl leading-tight">
            The dinner is one night. The listing runs for two months.
          </h2>
          <p className="mt-3 max-w-xl text-sm text-white/80">
            Packages are limited by the number of carousel slots. Talk to the dinner team to reserve
            a placement before the programme is printed.
          </p>
          <Link
            href="/advertise"
            className="mt-7 inline-flex rounded-full bg-white px-6 py-3 text-sm font-medium text-brand transition-colors hover:bg-accent-soft"
          >
            Reserve a placement
          </Link>
        </div>
      </section>
    </>
  );
}



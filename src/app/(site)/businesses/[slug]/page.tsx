import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SocialLinks } from "@/components/SocialLinks";
import { TrackEvent, TrackedLink } from "@/components/Tracking";
import { getBusinessBySlug } from "@/lib/data";
import { mediaUrl } from "@/lib/media";
import { listLivePollsForBusiness } from "@/lib/polls";

export const dynamic = "force-dynamic";

export default async function BusinessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);

  if (!business || business.status !== "live") notFound();

  const polls = await listLivePollsForBusiness(business.id);
  const livePoll = polls[0];

  const logo = mediaUrl(business.logoPath);
  const bannerUrl = mediaUrl(business.bannerPath);
  const videoUrl = mediaUrl(business.videoPath);
  const posterUrl = mediaUrl(business.videoPosterPath);
  const photos = business.photoPaths
    .map((path) => mediaUrl(path))
    .filter((url): url is string => Boolean(url));

  const contactRows = [
    business.contact.phone && {
      label: "Call",
      value: business.contact.phone,
      href: `tel:${business.contact.phone.replace(/\s+/g, "")}`,
    },
    business.contact.email && {
      label: "Email",
      value: business.contact.email,
      href: `mailto:${business.contact.email}`,
    },
    business.contact.website && {
      label: "Website",
      value: business.contact.website.replace(/^https?:\/\//, ""),
      href: business.contact.website,
    },
  ].filter(Boolean) as Array<{ label: string; value: string; href?: string }>;

  return (
    <article className="mx-auto w-full max-w-5xl px-5 py-12">
      <TrackEvent businessId={business.id} source="detail" />
      <Link href="/businesses" className="text-sm text-muted hover:text-brand">
        ← All businesses
      </Link>

      {bannerUrl && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-surface">
          <Image
            src={bannerUrl}
            alt={`${business.name} banner`}
            width={1600}
            height={600}
            className="h-auto w-full object-cover"
            priority
          />
        </div>
      )}

      <header className="mt-6 flex flex-wrap items-start gap-6">
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-line bg-surface">
          {logo ? (
            <Image
              src={logo}
              alt={`${business.name} logo`}
              width={80}
              height={80}
              className="h-full w-full object-contain p-2"
            />
          ) : (
            <span className="font-display text-3xl text-brand">{business.name.slice(0, 1)}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">{business.category}</p>
          <h1 className="mt-1 font-display text-3xl tracking-tight text-ink sm:text-4xl">
            {business.name}
          </h1>
          <p className="mt-2 text-base text-muted">{business.tagline}</p>
        </div>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <p className="whitespace-pre-line text-base leading-relaxed text-ink">
            {business.description}
          </p>

          {business.services.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-lg text-ink">Services</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {business.services.map((service) => (
                  <li
                    key={service}
                    className="rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink"
                  >
                    {service}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {videoUrl && (
            <div className="mt-8">
              <h2 className="font-display text-lg text-ink">Video</h2>
              <video
                src={videoUrl}
                poster={posterUrl ?? undefined}
                controls
                preload="metadata"
                playsInline
                className="mt-3 w-full rounded-2xl border border-line bg-black"
              />
            </div>
          )}

          {photos.length > 0 && (
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {photos.map((photo) => (
                <div key={photo} className="overflow-hidden rounded-2xl border border-line bg-surface">
                  <Image
                    src={photo}
                    alt={`${business.name} photo`}
                    width={800}
                    height={600}
                    className="h-56 w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="h-fit rounded-2xl border border-line bg-surface p-6">
          <h2 className="font-display text-lg text-ink">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {contactRows.length === 0 && (
              <li className="text-muted">Contact details available at the dinner desk.</li>
            )}
            {contactRows.map((row) => (
              <li key={row.label}>
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{row.label}</p>
                {row.href ? (
                  <TrackedLink
                    businessId={business.id}
                    href={row.href}
                    source={`contact:${row.label.toLowerCase()}`}
                    external={row.href.startsWith("http")}
                    className="text-brand hover:text-brand-ink"
                  >
                    {row.value}
                  </TrackedLink>
                ) : (
                  <span className="text-ink">{row.value}</span>
                )}
              </li>
            ))}
          </ul>

          <SocialLinks businessId={business.id} socials={business.contact.socials} />

          {business.address && (
            <div className="mt-5 border-t border-line pt-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted">Location</p>
              <p className="mt-1 text-sm text-ink">{business.address}</p>
              {business.mapsUrl && (
                <TrackedLink
                  businessId={business.id}
                  href={business.mapsUrl}
                  source="contact:maps"
                  external
                  className="mt-1 inline-flex text-sm text-brand hover:text-brand-ink"
                >
                  Open in Google Maps →
                </TrackedLink>
              )}
            </div>
          )}

          {livePoll && (
            <div className="mt-6 rounded-xl border border-brand/20 bg-brand-soft/50 p-4">
              <p className="text-sm font-medium text-ink">Quick poll</p>
              <p className="mt-1 text-xs text-muted">
                {livePoll.couponLabel ?? "Answer a few questions and tell them what you think."}
              </p>
              <Link
                href={`/polls/${livePoll.slug}`}
                className="mt-3 inline-flex rounded-full bg-brand px-4 py-2 text-xs font-medium text-white hover:bg-brand-ink"
              >
                Take the poll →
              </Link>
            </div>
          )}

          {business.isSample && (
            <p className="mt-6 rounded-xl bg-accent-soft/50 px-3.5 py-2.5 text-xs text-brand-ink">
              Sample listing — placeholder content used while the portal is being set up.
            </p>
          )}
        </aside>
      </div>
    </article>
  );
}

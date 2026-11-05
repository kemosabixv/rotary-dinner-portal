import Link from "next/link";
import { BusinessCard } from "@/components/BusinessCard";
import { listLiveBusinesses } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Business directory",
};

export default async function BusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const [{ category }, businesses] = await Promise.all([searchParams, listLiveBusinesses()]);

  const categories = Array.from(new Set(businesses.map((business) => business.category))).sort();
  const selected = category && categories.includes(category) ? category : undefined;
  const visible = selected
    ? businesses.filter((business) => business.category === selected)
    : businesses;

  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-14">
      <div className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand">
          Partner businesses
        </p>
        <h1 className="mt-4 font-display text-4xl tracking-tight text-ink">
          Businesses in the district network
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted">
          Every business here is advertising with the Foundation Dinner. Scan a table card at the
          dinner or browse the directory below.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/businesses"
          className={
            selected
              ? "rounded-full border border-line px-3.5 py-1.5 text-sm text-muted hover:border-brand hover:text-brand"
              : "rounded-full bg-brand px-3.5 py-1.5 text-sm text-white"
          }
        >
          All
        </Link>
        {categories.map((item) => (
          <Link
            key={item}
            href={`/businesses?category=${encodeURIComponent(item)}`}
            className={
              selected === item
                ? "rounded-full bg-brand px-3.5 py-1.5 text-sm text-white"
                : "rounded-full border border-line px-3.5 py-1.5 text-sm text-muted hover:border-brand hover:text-brand"
            }
          >
            {item}
          </Link>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-line px-6 py-14 text-center">
          <p className="font-display text-lg text-ink">No listings yet</p>
          <p className="mt-1 text-sm text-muted">
            Business listings appear here as soon as the dinner team publishes them.
          </p>
          <Link href="/advertise" className="mt-5 inline-flex text-sm text-brand hover:text-brand-ink">
            See the advertising packages →
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      )}
    </section>
  );
}

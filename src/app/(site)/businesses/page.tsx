import { BusinessDirectory } from "@/components/BusinessDirectory";
import { listLiveBusinessesPublic } from "@/lib/data";

export const revalidate = 60;

export const metadata = {
  title: "Business directory",
};

export default async function BusinessesPage() {
  const businesses = await listLiveBusinessesPublic();

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

      <BusinessDirectory businesses={businesses} />
    </section>
  );
}

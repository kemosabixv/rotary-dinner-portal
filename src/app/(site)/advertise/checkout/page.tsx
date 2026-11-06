import Link from "next/link";
import { redirect } from "next/navigation";
import { startCheckoutAction } from "@/lib/actions/checkout";
import packagesJson from "@/data/packages.json";
import { getProfile } from "@/lib/auth";
import type { PackagesConfig } from "@/lib/types";

const packages = packagesJson as PackagesConfig;

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Buy a package",
};

function priceFor(packageId: string): number | null {
  const tier = packages.tiers.find((item) => item.id === packageId);
  if (tier?.priceKes) return tier.priceKes;
  if (packageId === packages.addOn.id) return packages.addOn.priceKes;
  return null;
}

function labelFor(packageId: string): string {
  const tier = packages.tiers.find((item) => item.id === packageId);
  if (tier) return tier.name;
  return packages.addOn.name;
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ package?: string; error?: string }>;
}) {
  const { package: packageId, error } = await searchParams;
  const selected = packageId && priceFor(packageId) ? packageId : packages.tiers[0].id;
  const amountKes = priceFor(selected) ?? 0;

  // Purchases require an account: the listing, analytics and coupons hang off it.
  const profile = await getProfile();
  if (!profile) {
    redirect(
      `/sign-in?next=${encodeURIComponent(`/advertise/checkout?package=${selected}`)}`,
    );
  }

  return (
    <section className="mx-auto w-full max-w-2xl px-5 py-14">
      <Link href="/advertise" className="text-sm text-muted hover:text-brand">
        ← Packages
      </Link>

      <h1 className="mt-3 font-display text-3xl tracking-tight text-ink">Buy a package</h1>
      <p className="mt-2 text-base leading-relaxed text-muted">
        Pay securely by M-Pesa or card. You&apos;ll get a receipt by email.
      </p>

      {error && (
        <p className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      )}

      <form action={startCheckoutAction} className="mt-8 space-y-5">
        <label className="block text-sm font-medium text-ink">
          Package
          <select
            name="package"
            defaultValue={selected}
            className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand"
          >
            {packages.tiers.map((tier) => (
              <option key={tier.id} value={tier.id}>
                {tier.name} — {tier.priceLabel}
              </option>
            ))}
            <option value={packages.addOn.id}>
              {packages.addOn.name} — KES {packages.addOn.priceKes?.toLocaleString()} (add-on)
            </option>
          </select>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-ink">
            Your name
            <input
              name="name"
              required
              className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>
          <label className="block text-sm font-medium text-ink">
            Email (for your receipt)
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>
          <label className="block text-sm font-medium text-ink">
            Phone (optional)
            <input
              name="phone"
              className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>
          <label className="block text-sm font-medium text-ink">
            Business name (optional)
            <input
              name="businessName"
              className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Total</p>
            <p className="font-display text-2xl text-brand">KES {amountKes.toLocaleString()}</p>
          </div>
          <button
            type="submit"
            className="rounded-full bg-brand px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-ink"
          >
            Pay with M-Pesa or card
          </button>
        </div>

        <p className="text-xs text-muted">
          Need help with payment? Contact the dinner team.
        </p>
      </form>

      <p className="mt-8 text-xs text-muted">
        Selected: <span className="text-ink">{labelFor(selected)}</span>
      </p>
    </section>
  );
}

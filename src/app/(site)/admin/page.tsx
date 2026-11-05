import Link from "next/link";
import { BusinessForm } from "@/components/BusinessForm";
import { changePassword } from "@/lib/actions/auth";
import { createBusinessAction, setPaidAction, setStatusAction } from "@/lib/actions/businesses";
import { listBusinesses } from "@/lib/data";
import { listMetricTotals } from "@/lib/metrics";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  live: "bg-emerald-50 text-emerald-700 border-emerald-200",
  approved: "bg-amber-50 text-amber-700 border-amber-200",
  submitted: "bg-slate-50 text-slate-600 border-slate-200",
  expired: "bg-stone-100 text-stone-500 border-stone-200",
};

const paidStyles: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-rose-50 text-rose-700 border-rose-200",
  waived: "bg-slate-50 text-slate-600 border-slate-200",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const [{ notice }, businesses, totals] = await Promise.all([
    searchParams,
    listBusinesses(),
    listMetricTotals(),
  ]);

  const liveCount = businesses.filter((business) => business.status === "live").length;
  const unpaidCount = businesses.filter((business) => business.paidStatus === "pending").length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-ink">Businesses</h1>
          <p className="mt-1 text-sm text-muted">
            {businesses.length} listings · {liveCount} live · {unpaidCount} awaiting payment
          </p>
        </div>
        <Link href="/businesses" className="text-sm text-brand hover:text-brand-ink">
          Open public directory →
        </Link>
      </div>

      {notice && (
        <p className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink">{notice}</p>
      )}

      <details className="rounded-2xl border border-line bg-surface p-5">
        <summary className="cursor-pointer text-sm font-medium text-brand">
          + Add a business
        </summary>
        <div className="mt-6">
          <BusinessForm action={createBusinessAction} />
        </div>
      </details>

      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-paper text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Business</th>
              <th className="px-4 py-3 font-medium">Package</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Traffic (7d)</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {businesses.map((business) => (
              <tr key={business.id} className="align-top">
                <td className="px-4 py-3">
                  <Link href={`/admin/${business.id}`} className="font-medium text-ink hover:text-brand">
                    {business.name}
                  </Link>
                  <p className="text-xs text-muted">{business.category}</p>
                </td>
                <td className="px-4 py-3 text-muted">{business.packageTier.replace("_", " ")}</td>
                <td className="px-4 py-3">
                  <form action={setPaidAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={business.id} />
                    <select
                      name="paidStatus"
                      defaultValue={business.paidStatus}
                      className={`rounded-full border px-2.5 py-1 text-xs ${paidStyles[business.paidStatus]}`}
                    >
                      <option value="pending">pending</option>
                      <option value="paid">paid</option>
                      <option value="waived">waived</option>
                    </select>
                    <button type="submit" className="text-xs text-brand hover:text-brand-ink">
                      set
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <form action={setStatusAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={business.id} />
                    <select
                      name="status"
                      defaultValue={business.status}
                      className={`rounded-full border px-2.5 py-1 text-xs ${statusStyles[business.status]}`}
                    >
                      <option value="submitted">submitted</option>
                      <option value="approved">approved</option>
                      <option value="live">live</option>
                      <option value="expired">expired</option>
                    </select>
                    <button type="submit" className="text-xs text-brand hover:text-brand-ink">
                      set
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3 text-xs text-muted">
                  {totals.get(business.id)?.impressions7d ?? 0} views ·{" "}
                  {totals.get(business.id)?.clicks7d ?? 0}
                  {(totals.get(business.id)?.clicks7d ?? 0) === 1 ? " click" : " clicks"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/${business.id}`} className="text-xs text-brand hover:text-brand-ink">
                    Edit / media
                  </Link>
                </td>
              </tr>
            ))}
            {businesses.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted">
                  No businesses yet — add the first one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <details className="rounded-2xl border border-line bg-surface p-5">
        <summary className="cursor-pointer text-sm font-medium text-muted">Change my password</summary>
        <form action={changePassword} className="mt-4 grid gap-3 sm:grid-cols-3 sm:items-end">
          <label className="block text-sm font-medium text-ink">
            New password
            <input
              type="password"
              name="password"
              required
              minLength={10}
              autoComplete="new-password"
              className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>
          <label className="block text-sm font-medium text-ink">
            Confirm
            <input
              type="password"
              name="confirm"
              required
              minLength={10}
              autoComplete="new-password"
              className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>
          <button
            type="submit"
            className="h-10 rounded-full border border-brand px-5 text-sm font-medium text-brand hover:bg-brand hover:text-white"
          >
            Update password
          </button>
        </form>
      </details>
    </div>
  );
}

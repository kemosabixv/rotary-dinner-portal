import Link from "next/link";
import { redirect } from "next/navigation";
import { createUserAction, deleteUserAction, updateUserAction } from "@/lib/actions/users";
import { getProfile } from "@/lib/auth";
import { listBusinesses } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ROLE_STYLES: Record<string, string> = {
  superadmin: "bg-brand text-white border-brand",
  admin: "bg-brand-soft text-brand border-brand-edge/40",
  business: "bg-slate-50 text-slate-600 border-slate-200",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string; created?: string }>;
}) {
  const [{ saved, error, created }, me] = await Promise.all([searchParams, getProfile()]);

  if (!me || me.role !== "superadmin") redirect("/admin");

  const supabase = await createClient();
  const [{ data: profiles }, businesses] = await Promise.all([
    supabase
      .from("profiles")
      .select("user_id, email, role, business_id, created_at")
      .order("created_at", { ascending: true }),
    listBusinesses(),
  ]);

  const businessName = new Map(businesses.map((business) => [business.id, business.name]));
  const rows = (profiles ?? []) as Array<{
    user_id: string;
    email: string | null;
    role: string;
    business_id: string | null;
    created_at: string;
  }>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/admin" className="text-sm text-muted hover:text-brand">
            ← Admin
          </Link>
          <h1 className="mt-2 font-display text-2xl text-ink">Users</h1>
          <p className="mt-1 text-sm text-muted">
            {rows.length} accounts · {rows.filter((row) => row.role === "business").length} business ·{" "}
            {rows.filter((row) => row.role === "admin" || row.role === "superadmin").length} staff
          </p>
        </div>
        <p className="max-w-sm text-xs text-muted">
          New accounts are created by the person themselves (Google or email sign-up), or in Supabase
          → Authentication → Users. Removing a profile here revokes portal access; the login itself
          must be deleted in Supabase.
        </p>
      </div>

      {saved && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Saved.
        </p>
      )}
      {created && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          User created. Share the temporary password with them — they can change it after signing in.
        </p>
      )}
      {error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      )}

      <details className="rounded-2xl border border-line bg-surface p-5" open={false}>
        <summary className="cursor-pointer text-sm font-medium text-brand">+ Create a user</summary>

        <form action={createUserAction} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-ink">
              Email
              <input
                type="email"
                name="email"
                required
                className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand"
              />
            </label>
            <label className="block text-sm font-medium text-ink">
              Temporary password
              <input
                type="text"
                name="password"
                required
                minLength={10}
                className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand"
              />
              <span className="mt-1 block text-xs text-muted">
                At least 10 characters. Share it with them, they can change it after signing in.
              </span>
            </label>
            <label className="block text-sm font-medium text-ink">
              Role
              <select
                name="role"
                defaultValue="admin"
                className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand"
              >
                <option value="admin">admin — staff, manages everything</option>
                <option value="superadmin">superadmin — can also manage users</option>
                <option value="business">business — sees one listing only</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-ink">
              Linked listing (business accounts)
              <select
                name="businessId"
                defaultValue=""
                className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand"
              >
                <option value="">— none —</option>
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            type="submit"
            className="rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-ink"
          >
            Create user
          </button>
        </form>
      </details>

      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-paper text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Account</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Linked listing</th>
              <th className="px-4 py-3 font-medium text-right">Save</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr key={row.user_id} className="align-top">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{row.email ?? "—"}</p>
                  <p className="text-xs text-muted">
                    joined {new Date(row.created_at).toLocaleDateString("en-KE")}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <form
                    id={`user-${row.user_id}`}
                    action={updateUserAction}
                    className="flex flex-wrap items-center gap-2"
                  >
                    <input type="hidden" name="userId" value={row.user_id} />
                    <select
                      name="role"
                      defaultValue={row.role}
                      className={`rounded-full border px-2.5 py-1 text-xs ${ROLE_STYLES[row.role] ?? ""}`}
                    >
                      <option value="business">business</option>
                      <option value="admin">admin</option>
                      <option value="superadmin">superadmin</option>
                    </select>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <select
                    form={`user-${row.user_id}`}
                    name="businessId"
                    defaultValue={row.business_id ?? ""}
                    className="max-w-[16rem] rounded-xl border border-line bg-surface px-2.5 py-1.5 text-xs"
                  >
                    <option value="">— none —</option>
                    {businesses.map((business) => (
                      <option key={business.id} value={business.id}>
                        {business.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-muted">
                    {row.business_id ? businessName.get(row.business_id) ?? "unknown" : "not linked"}
                  </p>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="submit"
                      form={`user-${row.user_id}`}
                      className="rounded-full bg-brand px-4 py-1.5 text-xs font-medium text-white hover:bg-brand-ink"
                    >
                      Save
                    </button>
                    {row.user_id !== me.userId && (
                      <form action={deleteUserAction}>
                        <input type="hidden" name="userId" value={row.user_id} />
                        <button
                          type="submit"
                          className="text-xs text-rose-600 hover:text-rose-700"
                        >
                          Remove
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-muted">
                  No accounts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

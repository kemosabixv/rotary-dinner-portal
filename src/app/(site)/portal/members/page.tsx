import Link from "next/link";
import { redirect } from "next/navigation";
import {
  decideRequestAction,
  removeMemberAction,
  setMemberRoleAction,
} from "@/lib/actions/members";
import { getProfile } from "@/lib/auth";
import { getBusinessById } from "@/lib/data";
import { listBusinessMembers, listBusinessRequests } from "@/lib/members";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "People with access",
};

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner · read/write + manages access",
  editor: "Editor · read/write",
  viewer: "Viewer · read-only",
};

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ done?: string; saved?: string; removed?: string; error?: string }>;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/sign-in?next=/portal/members");
  if (profile.role !== "business") redirect("/admin");
  if (!profile.businessId) redirect("/portal/link");
  if (profile.businessRole !== "owner") redirect("/portal");

  const [{ done, saved, removed, error }, business, members, requests] = await Promise.all([
    searchParams,
    getBusinessById(profile.businessId),
    listBusinessMembers(profile.businessId),
    listBusinessRequests(profile.businessId),
  ]);

  const pending = requests.filter((request) => request.status === "pending");

  return (
    <section className="mx-auto w-full max-w-4xl space-y-8 px-5 py-12">
      <div>
        <Link href="/portal" className="text-sm text-muted hover:text-brand">
          ← My business
        </Link>
        <h1 className="mt-2 font-display text-3xl tracking-tight text-ink">People with access</h1>
        <p className="mt-1 text-sm text-muted">
          Approve or decline requests to link {business?.name ?? "this listing"}, and decide who can
          edit.
        </p>
      </div>

      {done && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Request updated.
        </p>
      )}
      {saved && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Role updated.
        </p>
      )}
      {removed && (
        <p className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink">
          Access removed.
        </p>
      )}
      {error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      )}

      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-display text-lg text-ink">Requests</h2>
        {pending.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No pending requests.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {pending.map((request) => (
              <li key={request.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm text-ink">{request.email ?? "A registered user"}</p>
                  {request.message && <p className="text-xs text-muted">{request.message}</p>}
                  <p className="text-xs text-muted">
                    {new Date(request.createdAt).toLocaleString("en-KE")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <form action={decideRequestAction}>
                    <input type="hidden" name="requestId" value={request.id} />
                    <input type="hidden" name="decision" value="accept" />
                    <button
                      type="submit"
                      className="rounded-full bg-brand px-4 py-2 text-xs font-medium text-white hover:bg-brand-ink"
                    >
                      Accept as viewer
                    </button>
                  </form>
                  <form action={decideRequestAction}>
                    <input type="hidden" name="requestId" value={request.id} />
                    <input type="hidden" name="decision" value="deny" />
                    <button
                      type="submit"
                      className="rounded-full border border-line px-4 py-2 text-xs text-muted hover:border-brand hover:text-brand"
                    >
                      Decline
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-display text-lg text-ink">Members</h2>
        <ul className="mt-4 divide-y divide-line">
          {members.map((member) => (
            <li key={member.userId} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm text-ink">
                  {member.email ?? member.userId}
                  {member.userId === profile.userId && (
                    <span className="ml-2 text-xs text-muted">(you)</span>
                  )}
                </p>
                <p className="text-xs text-muted">{ROLE_LABELS[member.role] ?? member.role}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <form action={setMemberRoleAction} className="flex items-center gap-2">
                  <input type="hidden" name="userId" value={member.userId} />
                  <select
                    name="role"
                    defaultValue={member.role}
                    className="rounded-full border border-line px-3 py-1.5 text-xs"
                  >
                    <option value="viewer">viewer (read-only)</option>
                    <option value="editor">editor (read/write)</option>
                    <option value="owner">owner (+ manage access)</option>
                  </select>
                  <button type="submit" className="text-xs text-brand hover:text-brand-ink">
                    Save
                  </button>
                </form>
                {member.userId !== profile.userId && (
                  <form action={removeMemberAction}>
                    <input type="hidden" name="userId" value={member.userId} />
                    <button
                      type="submit"
                      className="text-xs text-rose-600 hover:text-rose-700"
                    >
                      Remove
                    </button>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}

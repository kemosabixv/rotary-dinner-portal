import Link from "next/link";
import { signIn } from "@/lib/actions/auth";

export const metadata = {
  title: "Sign in",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <section className="mx-auto w-full max-w-md px-5 py-20">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand">Portal admin</p>
      <h1 className="mt-3 font-display text-3xl tracking-tight text-ink">Sign in</h1>
      <p className="mt-2 text-sm text-muted">
        Accounts are created by the portal owner. There is no self-registration.
      </p>

      {error && (
        <p className="mt-6 rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm text-brand-ink">
          {error}
        </p>
      )}

      <form action={signIn} className="mt-6 space-y-4">
        <input type="hidden" name="next" value={next ?? "/admin"} />

        <label className="block">
          <span className="text-sm font-medium text-ink">Email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="username"
            className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">Password</span>
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-full bg-brand px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-ink"
        >
          Sign in
        </button>
      </form>

      <p className="mt-8 text-xs text-muted">
        <Link href="/" className="text-brand hover:text-brand-ink">
          ← Back to the dinner portal
        </Link>
      </p>
    </section>
  );
}

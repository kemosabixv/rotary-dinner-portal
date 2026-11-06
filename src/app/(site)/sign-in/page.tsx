import Link from "next/link";
import { GoogleButton } from "@/components/GoogleButton";
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
    <section className="mx-auto w-full max-w-md px-5 py-16">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand">Sign in</p>
      <h1 className="mt-3 font-display text-3xl tracking-tight text-ink">
        Welcome back
      </h1>
      <p className="mt-2 text-sm text-muted">
        Business owners see their listing, analytics, polls and coupons.
      </p>

      {error && (
        <p className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      )}

      <div className="mt-6">
        <GoogleButton next={next} />
      </div>

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-muted">
        <span className="h-px flex-1 bg-line" />
        or use email
        <span className="h-px flex-1 bg-line" />
      </div>

      <form action={signIn} className="space-y-4">
        <input type="hidden" name="next" value={next ?? ""} />

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

      <p className="mt-6 text-sm text-muted">
        New business?{" "}
        <Link href="/register" className="text-brand hover:text-brand-ink">
          Create an account
        </Link>
      </p>
      <p className="mt-2 text-xs text-muted">
        <Link href="/" className="text-brand hover:text-brand-ink">
          ← Back to the dinner portal
        </Link>
      </p>
    </section>
  );
}

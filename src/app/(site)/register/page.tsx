import Link from "next/link";
import { GoogleButton } from "@/components/GoogleButton";
import { signUp } from "@/lib/actions/auth";

export const metadata = {
  title: "Create an account",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const { error, sent } = await searchParams;

  return (
    <section className="mx-auto w-full max-w-md px-5 py-16">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand">Business portal</p>
      <h1 className="mt-3 font-display text-3xl tracking-tight text-ink">Create an account</h1>
      <p className="mt-2 text-sm text-muted">
        For businesses advertising at the Foundation Dinner. You&apos;ll be able to see your listing,
        its views and clicks, and any polls and coupons.
      </p>

      {sent && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Account created. Check your email for the confirmation link, then sign in.
        </div>
      )}

      {error && (
        <p className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      )}

      <div className="mt-6">
        <GoogleButton label="Sign up with Google" />
      </div>

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-muted">
        <span className="h-px flex-1 bg-line" />
        or use email
        <span className="h-px flex-1 bg-line" />
      </div>

      <form action={signUp} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-ink">Email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">Password</span>
          <input
            type="password"
            name="password"
            required
            minLength={10}
            autoComplete="new-password"
            className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand"
          />
          <span className="mt-1 block text-xs text-muted">At least 10 characters.</span>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">Confirm password</span>
          <input
            type="password"
            name="confirm"
            required
            minLength={10}
            autoComplete="new-password"
            className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-full bg-brand px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-ink"
        >
          Create account
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-brand hover:text-brand-ink">
          Sign in
        </Link>
      </p>
      <p className="mt-2 text-xs text-muted">
        Your listing is linked to your account by the dinner team — usually within a day of payment.
      </p>
    </section>
  );
}

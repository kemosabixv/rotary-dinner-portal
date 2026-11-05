import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex flex-1 items-center justify-center px-5 py-20">
        <div className="w-full max-w-lg text-center">
          <p className="font-display text-6xl leading-none text-brand">404</p>
          <h1 className="mt-4 font-display text-3xl tracking-tight text-ink">
            We couldn&apos;t find that page
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted">
            The link may be wrong, or a business listing has ended. Everything still live is in the
            directory.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/businesses"
              className="rounded-full bg-brand px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-ink"
            >
              Browse the businesses
            </Link>
            <Link
              href="/"
              className="rounded-full border border-line px-6 py-3 text-sm font-medium text-muted transition-colors hover:border-brand hover:text-brand"
            >
              Back to the dinner
            </Link>
          </div>

          <p className="mt-10 text-xs text-muted">
            Advertising enquiries are handled by the dinner team —{" "}
            <Link href="/advertise" className="text-brand hover:text-brand-ink">
              see the packages
            </Link>
            .
          </p>
        </div>
      </main>

      <footer className="border-t border-line bg-surface/60">
        <div className="mx-auto w-full max-w-6xl px-5 py-6 text-center text-xs text-muted">
          Rotary District 9215 · Foundation Dinner · 21 November 2026 · Trademark Hotel, Nairobi
        </div>
      </footer>
    </div>
  );
}

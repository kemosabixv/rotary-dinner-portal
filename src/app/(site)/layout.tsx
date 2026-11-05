import { SiteHeader } from "@/components/SiteHeader";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <footer className="mt-20 border-t border-line bg-surface/60">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-10 sm:grid-cols-2">
          <div>
            <p className="font-display text-lg text-brand">Rotary District 9215</p>
            <p className="mt-1 text-sm text-muted">
              Foundation Dinner · 21 November 2026 · Trademark Hotel, Nairobi
            </p>
          </div>
          <div className="text-sm text-muted sm:text-right">
            <p>Business partner portal — enquiries handled by the dinner team.</p>
            <p className="mt-4 text-xs text-muted/80">
              Sample listings until partner submissions are loaded.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/advertise", label: "Advertise" },
  { href: "/businesses", label: "Businesses" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-5 py-4">
        <Link href="/" className="group flex items-baseline gap-3">
          <span className="font-display text-lg font-semibold tracking-tight text-brand">
            Rotary D9215
          </span>
          <span className="hidden text-xs uppercase tracking-[0.18em] text-muted sm:inline">
            Foundation Dinner 2026
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-muted transition-colors hover:bg-accent-soft/60 hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

import Image from "next/image";
import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/advertise", label: "Advertise" },
  { href: "/businesses", label: "Businesses" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-surface/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-5">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <Image
            src="/brand/rotary-d9215-trf.png"
            alt="Rotary District 9215 and The Rotary Foundation"
            width={1281}
            height={353}
            priority
            className="h-10 w-auto sm:h-12"
          />
          <span className="hidden text-[10px] font-medium uppercase tracking-[0.2em] text-muted xl:inline">
            Foundation Dinner 2026
          </span>
        </Link>

        <nav className="flex items-center gap-0.5 text-xs sm:text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-2 py-2 text-muted transition-colors hover:bg-brand-soft/70 hover:text-brand sm:px-3 ${
                link.href === "/" ? "hidden sm:inline-block" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

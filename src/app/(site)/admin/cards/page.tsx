import Link from "next/link";
import { PrintButton } from "@/components/PrintButton";
import { listLiveBusinesses } from "@/lib/data";

export const dynamic = "force-dynamic";

function Card({ path, title, caption }: { path: string; title: string; caption: string }) {
  const src = `/api/qr?path=${encodeURIComponent(path)}&size=600`;

  return (
    <div className="flex break-inside-avoid flex-col items-center rounded-2xl border border-line bg-white p-6 text-center">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
        Rotary D9215 · Foundation Dinner
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={`QR code for ${title}`} className="mt-4 h-36 w-36" />
      <p className="mt-4 font-display text-lg leading-tight text-ink">{title}</p>
      <p className="mt-1 text-xs text-muted">{caption}</p>
      <a
        href={`${src}&download=1`}
        className="mt-3 text-[10px] uppercase tracking-wider text-brand print:hidden"
      >
        Download SVG
      </a>
    </div>
  );
}

export default async function CardsPage() {
  const businesses = await listLiveBusinesses();

  return (
    <div className="space-y-8">
      <div className="print:hidden">
        <Link href="/admin" className="text-sm text-muted hover:text-brand">
          ← Admin
        </Link>
        <h1 className="mt-2 font-display text-2xl text-ink">Table cards</h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
          One A4 sheet with {businesses.length + 1} cards. Print at 100% (no scaling), ideally on
          300gsm card. The QR codes use high error correction and point at the host serving this
          page — check the URL before sending to print, and reprint if the subdomain changes.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <PrintButton />
          <a
            href="/api/qr?path=/businesses&size=1200&download=1"
            className="rounded-full border border-line px-5 py-2.5 text-sm text-muted transition-colors hover:border-brand hover:text-brand"
          >
            Download directory QR
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card
          path="/businesses"
          title="Partner businesses"
          caption="Scan to see who is advertising at the dinner"
        />
        {businesses.map((business) => (
          <Card
            key={business.id}
            path={`/businesses/${business.slug}`}
            title={business.name}
            caption={business.tagline}
          />
        ))}
      </div>
    </div>
  );
}

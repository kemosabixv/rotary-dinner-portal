import { headers } from "next/headers";
import Link from "next/link";
import { PrintButton } from "@/components/PrintButton";
import { setQrBaseUrlAction } from "@/lib/actions/settings";
import { listLiveBusinesses } from "@/lib/data";
import { getQrBaseUrl } from "@/lib/settings";

export const dynamic = "force-dynamic";

type CardData = { path: string; title: string; caption: string; slug: string };

function Card({ card, base }: { card: CardData; base: string }) {
  const src = `/api/qr?path=${encodeURIComponent(card.path)}&size=600`;
  const url = `${base}${card.path}`.replace(/^https?:\/\//, "");

  return (
    <div className="flex break-inside-avoid flex-col items-center rounded-2xl border border-line bg-white p-5 text-center">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-brand">
        Rotary District 9215
      </p>
      <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-muted">
        Foundation Dinner · 21 Nov 2026 · Trademark Hotel, Nairobi
      </p>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={`QR code for ${card.title}`} className="mt-4 h-40 w-40" />

      <p className="mt-3 font-display text-lg leading-tight text-ink">{card.title}</p>
      <p className="mt-1 text-xs text-muted">{card.caption}</p>
      <p className="mt-2 font-mono text-[9px] text-muted">{url}</p>

      <div className="mt-2 flex items-center gap-3 print:hidden">
        <a
          href={`${src}&download=1`}
          className="text-[10px] uppercase tracking-wider text-brand hover:text-brand-ink"
        >
          SVG
        </a>
        <Link
          href={`/admin/cards?only=${card.slug}`}
          className="text-[10px] uppercase tracking-wider text-muted hover:text-brand"
        >
          Print one
        </Link>
      </div>
    </div>
  );
}

export default async function CardsPage({
  searchParams,
}: {
  searchParams: Promise<{ only?: string; saved?: string; error?: string }>;
}) {
  const [{ only, saved, error }, businesses, override] = await Promise.all([
    searchParams,
    listLiveBusinesses(),
    getQrBaseUrl(),
  ]);

  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
  const proto = headerStore.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const base = override || `${proto}://${host}`;

  const cards: CardData[] = [
    {
      path: "/businesses",
      title: "Partner businesses",
      caption: "Scan to see who is advertising at the dinner",
      slug: "directory",
    },
    ...businesses.map((business) => ({
      path: `/businesses/${business.slug}`,
      title: business.name,
      caption: business.tagline,
      slug: business.slug,
    })),
  ];

  const selected = only
    ? cards.find((card) => card.slug === only) ?? cards[0]
    : null;
  const visible = selected ? [selected] : cards;

  return (
    <div className="space-y-8">
      <div className="print:hidden">
        <Link href="/admin" className="text-sm text-muted hover:text-brand">
          ← Admin
        </Link>
        <h1 className="mt-2 font-display text-2xl text-ink">
          {selected ? `Card: ${selected.title}` : "Table cards"}
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
          {selected
            ? "Single card, print-ready. Print at 100% (no scaling) on card stock."
            : `One A4 sheet with ${cards.length} cards. Print at 100% (no scaling), ideally on 300gsm card.`}
        </p>

        {saved && (
          <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
            QR base URL saved.
          </p>
        )}
        {error && (
          <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-800">
            {error}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-line bg-surface p-4">
          <form action={setQrBaseUrlAction} className="flex flex-wrap items-end gap-3">
            <label className="block text-sm font-medium text-ink">
              QR base URL
              <input
                name="baseUrl"
                defaultValue={override}
                placeholder={base}
                className="mt-1.5 w-72 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand"
              />
            </label>
            <button
              type="submit"
              className="rounded-full border border-brand px-5 py-2.5 text-sm font-medium text-brand transition-colors hover:bg-brand hover:text-white"
            >
              Save
            </button>
            <span className="text-xs text-muted">
              Empty = use this host. Codes currently encode <span className="text-ink">{base}</span>
            </span>
          </form>

          <div className="flex items-center gap-3">
            <PrintButton />
            <a
              href="/api/qr?path=/businesses&size=1200&download=1"
              className="rounded-full border border-line px-5 py-2.5 text-sm text-muted transition-colors hover:border-brand hover:text-brand"
            >
              Directory QR
            </a>
            {selected && (
              <Link
                href="/admin/cards"
                className="rounded-full border border-line px-5 py-2.5 text-sm text-muted transition-colors hover:border-brand hover:text-brand"
              >
                All cards
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className={selected ? "flex justify-center" : "grid grid-cols-2 gap-4"}>
        {visible.map((card) => (
          <Card key={card.slug} card={card} base={base} />
        ))}
      </div>
    </div>
  );
}

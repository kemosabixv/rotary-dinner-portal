"use client";

import Link from "next/link";
import { useState } from "react";
import { BusinessCard } from "@/components/BusinessCard";
import type { Business } from "@/lib/types";

/** Category filtering runs in the browser so the page itself can be cached. */
export function BusinessDirectory({ businesses }: { businesses: Business[] }) {
  const categories = Array.from(new Set(businesses.map((business) => business.category))).sort();
  const [selected, setSelected] = useState<string | undefined>(undefined);

  const visible = selected
    ? businesses.filter((business) => business.category === selected)
    : businesses;

  const chip = (active: boolean) =>
    active
      ? "rounded-full bg-brand px-3.5 py-1.5 text-sm text-white"
      : "rounded-full border border-line px-3.5 py-1.5 text-sm text-muted hover:border-brand hover:text-brand";

  return (
    <>
      <div className="mt-8 flex flex-wrap gap-2">
        <button type="button" onClick={() => setSelected(undefined)} className={chip(!selected)}>
          All
        </button>
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setSelected(item)}
            className={chip(selected === item)}
          >
            {item}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-line px-6 py-14 text-center">
          <p className="font-display text-lg text-ink">No listings yet</p>
          <p className="mt-1 text-sm text-muted">
            Business listings appear here as soon as the dinner team publishes them.
          </p>
          <Link href="/advertise" className="mt-5 inline-flex text-sm text-brand hover:text-brand-ink">
            See the advertising packages →
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      )}
    </>
  );
}

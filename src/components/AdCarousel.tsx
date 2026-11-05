"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export type CarouselItem = {
  slug: string;
  name: string;
  category: string;
  tagline: string;
  logoUrl: string | null;
};

export function AdCarousel({
  items,
  variant = "panel",
  intervalMs = 6000,
}: {
  items: CarouselItem[];
  variant?: "panel" | "overlay";
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % items.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [paused, items.length, intervalMs]);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line px-6 py-10 text-center text-sm text-muted">
        Business ads appear here as they are approved.
      </div>
    );
  }

  const item = items[index];
  const overlay = variant === "overlay";

  return (
    <div
      className={
        overlay
          ? "w-full"
          : "rounded-2xl border border-line bg-surface p-6 sm:p-8"
      }
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="flex items-center gap-5">
        <div
          className={
            overlay
              ? "flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/90 p-2 shadow-lg"
              : "flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-paper"
          }
        >
          {item.logoUrl ? (
            <Image
              src={item.logoUrl}
              alt={`${item.name} logo`}
              width={96}
              height={96}
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="font-display text-2xl text-brand">{item.name.slice(0, 1)}</span>
          )}
        </div>

        <div className="min-w-0">
          <p
            className={
              overlay
                ? "text-xs font-medium uppercase tracking-[0.2em] text-white/70"
                : "text-[11px] uppercase tracking-[0.16em] text-muted"
            }
          >
            {item.category}
          </p>
          <p
            className={
              overlay
                ? "font-display text-3xl font-semibold leading-tight text-white drop-shadow"
                : "font-display text-xl leading-tight text-ink"
            }
          >
            {item.name}
          </p>
          <p
            className={
              overlay
                ? "mt-1 max-w-2xl text-base text-white/80"
                : "mt-1 text-sm text-muted"
            }
          >
            {item.tagline}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5">
          {items.map((dot, dotIndex) => (
            <button
              key={dot.slug}
              type="button"
              aria-label={`Show ${dot.name}`}
              aria-current={dotIndex === index}
              onClick={() => setIndex(dotIndex)}
              className={
                dotIndex === index
                  ? overlay
                    ? "h-1.5 w-6 rounded-full bg-white"
                    : "h-1.5 w-6 rounded-full bg-brand"
                  : overlay
                    ? "h-1.5 w-1.5 rounded-full bg-white/40"
                    : "h-1.5 w-1.5 rounded-full bg-line"
              }
            />
          ))}
        </div>

        {!overlay && (
          <Link
            href={`/businesses/${item.slug}`}
            className="text-xs font-medium uppercase tracking-wider text-brand hover:text-brand-ink"
          >
            View listing →
          </Link>
        )}
      </div>
    </div>
  );
}

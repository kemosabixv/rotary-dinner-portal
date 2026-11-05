"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { trackEvent } from "@/components/Tracking";

export type CarouselItem = {
  id: string;
  slug: string;
  name: string;
  category: string;
  tagline: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  /** True when bannerUrl is a gallery photo rather than a designed banner. */
  bannerFallback?: boolean;
};

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path
        d={direction === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AdCarousel({
  items,
  variant = "panel",
  intervalMs = 6000,
  backgroundMode = "transparent",
  trackImpressions = true,
}: {
  items: CarouselItem[];
  variant?: "panel" | "overlay";
  intervalMs?: number;
  backgroundMode?: "transparent" | "creative";
  /** Stage/overlay displays should not inflate listing analytics. */
  trackImpressions?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (delta: number) => {
      if (items.length === 0) return;
      setIndex((current) => (current + delta + items.length) % items.length);
    },
    [items.length],
  );

  useEffect(() => {
    if (paused || items.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % items.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [paused, items.length, intervalMs, index]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const activeId = items[index]?.id;

  useEffect(() => {
    if (!activeId || !trackImpressions) return;
    trackEvent({ businessId: activeId, kind: "impression", source: "carousel" });
  }, [activeId, trackImpressions]);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line px-6 py-10 text-center text-sm text-muted">
        Business ads appear here as they are approved.
      </div>
    );
  }

  const item = items[index];
  const overlay = variant === "overlay";
  const creative = overlay && backgroundMode === "creative";

  const dots = (tone: "dark" | "light") => (
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
              ? tone === "light"
                ? "h-1.5 w-6 rounded-full bg-white"
                : "h-1.5 w-6 rounded-full bg-brand"
              : tone === "light"
                ? "h-1.5 w-1.5 rounded-full bg-white/40"
                : "h-1.5 w-1.5 rounded-full bg-line"
          }
        />
      ))}
    </div>
  );

  const buttonClass = (tone: "dark" | "light") =>
    tone === "light"
      ? "flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
      : "flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-brand hover:text-brand";

  // Creative mode: the slide *is* the screen. No card, no panel.
  if (creative) {
    return (
      <div
        className="fixed inset-0 z-0 overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {item.bannerUrl ? (
          <Image
            src={item.bannerUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0b1b3a] via-[#122b52] to-[#17458f]" />
        )}

        {/* Lighter scrim when the artwork speaks for itself; heavier over the gradient poster */}
        <div
          className={`absolute inset-0 ${
            item.bannerUrl && !item.bannerFallback
              ? "bg-gradient-to-b from-black/45 via-black/10 to-black/60"
              : "bg-gradient-to-b from-black/55 via-black/45 to-black/70"
          }`}
        />

        <p className="absolute inset-x-0 top-8 text-center text-[11px] font-medium uppercase tracking-[0.32em] text-white/70">
          Partner businesses · District 9215 Foundation Dinner
        </p>

        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
          {(!item.bannerUrl || item.bannerFallback) && (
            <>
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-white/95 p-2 shadow-lg">
                {item.logoUrl ? (
                  <Image
                    src={item.logoUrl}
                    alt={`${item.name} logo`}
                    width={80}
                    height={80}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="font-display text-2xl text-brand">{item.name.slice(0, 1)}</span>
                )}
              </div>

              <p className="mt-6 text-xs font-medium uppercase tracking-[0.28em] text-white/70">
                {item.category}
              </p>
              <h2 className="mt-3 max-w-4xl font-display text-5xl font-semibold leading-tight text-white drop-shadow-lg sm:text-6xl">
                {item.name}
              </h2>
              <p className="mt-3 max-w-2xl text-lg text-white/85 sm:text-xl">{item.tagline}</p>
            </>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous business"
            className={buttonClass("light")}
          >
            <Chevron direction="left" />
          </button>
          {dots("light")}
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next business"
            className={buttonClass("light")}
          >
            <Chevron direction="right" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        overlay ? "w-full" : "self-start overflow-hidden rounded-2xl border border-line bg-surface"
      }
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {item.bannerUrl ? (
        <div className="relative aspect-[8/3] w-full">
          <Image
            src={item.bannerUrl}
            alt={`${item.name} banner`}
            fill
            sizes="(max-width: 768px) 100vw, 640px"
            className="object-cover"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/5" />

          <div className="absolute inset-x-0 bottom-0 flex items-end gap-4 p-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/95 p-1.5">
              {item.logoUrl ? (
                <Image
                  src={item.logoUrl}
                  alt={`${item.name} logo`}
                  width={56}
                  height={56}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="font-display text-lg text-brand">{item.name.slice(0, 1)}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">
                {item.category}
              </p>
              <p className="font-display text-2xl font-semibold leading-tight text-white drop-shadow">
                {item.name}
              </p>
              <p className="mt-0.5 line-clamp-1 text-sm text-white/80">{item.tagline}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-paper">
              {item.logoUrl ? (
                <Image
                  src={item.logoUrl}
                  alt={`${item.name} logo`}
                  width={64}
                  height={64}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="font-display text-2xl text-brand">{item.name.slice(0, 1)}</span>
              )}
            </div>

            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{item.category}</p>
              <p className="font-display text-xl leading-tight text-ink">{item.name}</p>
              <p className="mt-1 text-sm text-muted">{item.tagline}</p>
            </div>
          </div>
        </div>
      )}

      <div
        className={
          overlay
            ? "mt-4 flex items-center justify-center gap-3"
            : "flex items-center justify-between gap-4 border-t border-line px-5 py-3"
        }
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous business"
            className={buttonClass(overlay ? "light" : "dark")}
          >
            <Chevron direction="left" />
          </button>

          {dots(overlay ? "light" : "dark")}

          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next business"
            className={buttonClass(overlay ? "light" : "dark")}
          >
            <Chevron direction="right" />
          </button>
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

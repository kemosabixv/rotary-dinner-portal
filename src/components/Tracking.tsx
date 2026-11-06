"use client";

import { useEffect, useRef } from "react";

export function trackEvent(
  payload: { businessId: string; kind: "impression" | "click"; source: string },
  dedupeKey?: string,
) {
  if (dedupeKey && typeof window !== "undefined") {
    try {
      const key = `trk:${dedupeKey}`;
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      // Private mode / storage disabled: count it rather than lose it.
    }
  }

  const body = JSON.stringify(payload);
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    return;
  }
  void fetch("/api/track", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    keepalive: true,
  });
}

/** Fires one impression per business per browser session. */
export function TrackEvent({
  businessId,
  kind = "impression",
  source,
}: {
  businessId: string;
  kind?: "impression" | "click";
  source: string;
}) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackEvent({ businessId, kind, source }, `${kind}:${source}:${businessId}`);
  }, [businessId, kind, source]);

  return null;
}

/** Anchor that records a click before navigating. */
export function TrackedLink({
  businessId,
  href,
  source,
  className,
  children,
  external = false,
}: {
  businessId: string;
  href: string;
  source: string;
  className?: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      className={className}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      onClick={() => trackEvent({ businessId, kind: "click", source })}
    >
      {children}
    </a>
  );
}

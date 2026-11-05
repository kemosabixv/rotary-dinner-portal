import { SocialIcon, type SocialName } from "@/components/SocialIcons";
import { TrackedLink } from "@/components/Tracking";
import type { SocialLinks as SocialLinksValue } from "@/lib/types";

const PLATFORMS: Array<{ key: SocialName; label: string }> = [
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "x", label: "X" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "tiktok", label: "TikTok" },
  { key: "youtube", label: "YouTube" },
  { key: "whatsapp", label: "WhatsApp" },
];

function hrefFor(key: SocialName, value: string): string {
  if (key === "whatsapp" && !/^https?:/i.test(value)) {
    return `https://wa.me/${value.replace(/[^\d]/g, "")}`;
  }
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

export function SocialLinks({
  businessId,
  socials,
}: {
  businessId: string;
  socials: SocialLinksValue;
}) {
  const items = PLATFORMS.map(({ key, label }) => {
    const value = socials[key]?.trim();
    return value ? { key, label, href: hrefFor(key, value) } : null;
  }).filter((item): item is { key: SocialName; label: string; href: string } => Boolean(item));

  if (items.length === 0) return null;

  return (
    <div className="mt-5 border-t border-line pt-4">
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted">Social</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <TrackedLink
            key={item.key}
            businessId={businessId}
            href={item.href}
            source={`social:${item.key}`}
            external
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-brand hover:text-brand"
          >
            <SocialIcon name={item.key} className="h-4 w-4" />
            <span className="sr-only">{item.label}</span>
          </TrackedLink>
        ))}
      </div>
    </div>
  );
}

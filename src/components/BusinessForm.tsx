import type { Business, BusinessInput } from "@/lib/types";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand";
const labelClass = "block text-sm font-medium text-ink";

export function BusinessForm({
  action,
  business,
  variant = "staff",
  hidden,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  business?: Business;
  variant?: "staff" | "owner";
  hidden?: Record<string, string>;
  submitLabel?: string;
}) {
  const defaults: Partial<BusinessInput> = business
    ? {
        name: business.name,
        category: business.category,
        tagline: business.tagline,
        description: business.description,
        services: business.services,
        phone: business.contact.phone,
        email: business.contact.email,
        website: business.contact.website,
        socials: business.contact.socials,
        packageTier: business.packageTier,
        paidStatus: business.paidStatus,
        status: business.status,
        carouselWeight: business.carouselWeight,
        activeFrom: business.activeFrom,
        activeTo: business.activeTo,
        address: business.address ?? "",
        mapsUrl: business.mapsUrl ?? "",
        pollQuiz: business.addOns.includes("poll_quiz"),
      }
    : {
        packageTier: "basic_5k",
        paidStatus: "pending",
        status: "submitted",
        carouselWeight: 1,
        activeFrom: new Date().toISOString().slice(0, 10),
        activeTo: "2026-12-31",
      };

  return (
    <form action={action} className="space-y-6">
      {business && <input type="hidden" name="id" value={business.id} />}
      {Object.entries(hidden ?? {}).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Business name
          <input name="name" required defaultValue={defaults.name} className={fieldClass} />
        </label>
        <label className={labelClass}>
          Category
          <input
            name="category"
            defaultValue={defaults.category ?? "General"}
            placeholder="Food & Beverage"
            className={fieldClass}
          />
        </label>
      </div>

      <label className={labelClass}>
        Tagline (one line)
        <input name="tagline" defaultValue={defaults.tagline} className={fieldClass} />
      </label>

      <label className={labelClass}>
        Description
        <textarea
          name="description"
          rows={5}
          defaultValue={defaults.description}
          className={fieldClass}
        />
      </label>

      <label className={labelClass}>
        Services (one per line)
        <textarea
          name="services"
          rows={4}
          defaultValue={defaults.services?.join("\n")}
          className={fieldClass}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Address / location
          <input
            name="address"
            defaultValue={defaults.address}
            placeholder="Riverside Drive, Nairobi"
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          Google Maps link
          <input
            name="mapsUrl"
            defaultValue={defaults.mapsUrl}
            placeholder="https://maps.app.goo.gl/…"
            className={fieldClass}
          />
        </label>
      </div>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-sm font-medium text-ink">Contact</legend>
        <label className={labelClass}>
          Phone
          <input name="phone" defaultValue={defaults.phone} className={fieldClass} />
        </label>
        <label className={labelClass}>
          Email
          <input name="email" type="email" defaultValue={defaults.email} className={fieldClass} />
        </label>
        <label className={labelClass}>
          Website
          <input name="website" defaultValue={defaults.website} className={fieldClass} />
        </label>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-sm font-medium text-ink">
          Social links (full URL, or a phone number for WhatsApp)
        </legend>
        <label className={labelClass}>
          Instagram
          <input
            name="instagram"
            defaultValue={defaults.socials?.instagram}
            placeholder="https://instagram.com/…"
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          Facebook
          <input
            name="facebook"
            defaultValue={defaults.socials?.facebook}
            placeholder="https://facebook.com/…"
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          X
          <input
            name="x_url"
            defaultValue={defaults.socials?.x}
            placeholder="https://x.com/…"
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          LinkedIn
          <input
            name="linkedin"
            defaultValue={defaults.socials?.linkedin}
            placeholder="https://linkedin.com/company/…"
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          TikTok
          <input
            name="tiktok"
            defaultValue={defaults.socials?.tiktok}
            placeholder="https://tiktok.com/@…"
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          YouTube
          <input
            name="youtube"
            defaultValue={defaults.socials?.youtube}
            placeholder="https://youtube.com/@…"
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          WhatsApp
          <input
            name="whatsapp"
            defaultValue={defaults.socials?.whatsapp}
            placeholder="+254 700 000 000"
            className={fieldClass}
          />
        </label>
      </fieldset>

      {variant === "staff" && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className={labelClass}>
              Package
              <select name="packageTier" defaultValue={defaults.packageTier} className={fieldClass}>
                <option value="basic_5k">Community listing (5,000)</option>
                <option value="premium_10k">Featured partner (10,000)</option>
                <option value="sponsor">Sponsor</option>
                <option value="comp">Complimentary</option>
              </select>
            </label>
            <label className={labelClass}>
              Payment
              <select name="paidStatus" defaultValue={defaults.paidStatus} className={fieldClass}>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="waived">Waived</option>
              </select>
            </label>
            <label className={labelClass}>
              Status
              <select name="status" defaultValue={defaults.status} className={fieldClass}>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="live">Live</option>
                <option value="expired">Expired</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className={labelClass}>
              Carousel weight (1–5)
              <input
                name="carouselWeight"
                type="number"
                min={1}
                max={5}
                defaultValue={defaults.carouselWeight ?? 1}
                className={fieldClass}
              />
            </label>
            <label className={labelClass}>
              Active from
              <input name="activeFrom" type="date" defaultValue={defaults.activeFrom} className={fieldClass} />
            </label>
            <label className={labelClass}>
              Active to
              <input name="activeTo" type="date" defaultValue={defaults.activeTo} className={fieldClass} />
            </label>
          </div>

          <label className="flex items-center gap-2.5 text-sm text-ink">
            <input
              type="checkbox"
              name="pollQuiz"
              defaultChecked={defaults.pollQuiz}
              className="h-4 w-4 rounded border-line"
            />
            Includes the poll/quiz add-on
          </label>
        </>
      )}

      <button
        type="submit"
        className="rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-ink"
      >
        {submitLabel ?? (business ? (variant === "owner" ? "Save listing" : "Save changes") : "Create business")}
      </button>
    </form>
  );
}

"use client";

import { useRef, useState, useTransition } from "react";
import { updateMediaAction } from "@/lib/actions/businesses";
import { MEDIA_BUCKET, mediaUrl } from "@/lib/media";
import { createClient } from "@/lib/supabase/client";

const MAX_BYTES = 5 * 1024 * 1024;

export function MediaManager({
  businessId,
  logoPath,
  photoPaths,
}: {
  businessId: string;
  logoPath: string | null;
  photoPaths: string[];
}) {
  const [logo, setLogo] = useState<string | null>(logoPath);
  const [photos, setPhotos] = useState<string[]>(photoPaths);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const logoInput = useRef<HTMLInputElement>(null);
  const photoInput = useRef<HTMLInputElement>(null);

  async function persist(nextLogo: string | null, nextPhotos: string[]) {
    setLogo(nextLogo);
    setPhotos(nextPhotos);
    startTransition(async () => {
      await updateMediaAction(businessId, { logoPath: nextLogo, photoPaths: nextPhotos });
    });
  }

  async function upload(files: FileList | null, kind: "logo" | "photo") {
    if (!files || files.length === 0) return;
    setError(null);

    const supabase = createClient();
    let nextLogo = logo;
    let nextPhotos = [...photos];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        setError(`${file.name} is not an image.`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError(`${file.name} is larger than 5MB.`);
        continue;
      }

      setBusy(file.name);
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-48);
      const path = `${businessId}/${kind}-${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });

      if (uploadError) {
        setError(uploadError.message);
        continue;
      }

      if (kind === "logo") {
        if (nextLogo) await supabase.storage.from(MEDIA_BUCKET).remove([nextLogo]);
        nextLogo = path;
      } else {
        nextPhotos = [...nextPhotos, path].slice(0, 6);
      }
    }

    setBusy(null);
    await persist(nextLogo, nextPhotos);

    if (logoInput.current) logoInput.current.value = "";
    if (photoInput.current) photoInput.current.value = "";
  }

  async function remove(path: string, kind: "logo" | "photo") {
    setError(null);
    const supabase = createClient();
    const { error: removeError } = await supabase.storage.from(MEDIA_BUCKET).remove([path]);
    if (removeError) {
      setError(removeError.message);
      return;
    }

    if (kind === "logo") {
      await persist(null, photos);
    } else {
      await persist(logo, photos.filter((item) => item !== path));
    }
  }

  return (
    <section className="rounded-2xl border border-line bg-surface p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-lg text-ink">Media</h2>
        <p className="text-xs text-muted">JPG, PNG or WebP · max 5MB per file · up to 6 photos</p>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm text-brand-ink">
          {error}
        </p>
      )}

      <div className="mt-5 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-ink">Logo</p>
          <div className="mt-2 flex h-28 w-28 items-center justify-center overflow-hidden rounded-xl border border-line bg-paper">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrl(logo) ?? ""} alt="Business logo" className="h-full w-full object-contain p-2" />
            ) : (
              <span className="text-xs text-muted">No logo</span>
            )}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <input
              ref={logoInput}
              type="file"
              accept="image/*"
              onChange={(event) => upload(event.target.files, "logo")}
              className="block w-full text-xs text-muted file:mr-3 file:rounded-full file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-xs file:text-white"
            />
            {logo && (
              <button
                type="button"
                onClick={() => remove(logo, "logo")}
                className="text-xs text-brand hover:text-brand-ink"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-ink">Photos</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {photos.map((path) => (
              <div key={path} className="group relative overflow-hidden rounded-lg border border-line bg-paper">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mediaUrl(path) ?? ""} alt="Business photo" className="h-20 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => remove(path, "photo")}
                  className="absolute right-1 top-1 rounded-full bg-white/90 px-1.5 text-[10px] text-brand opacity-0 transition-opacity group-hover:opacity-100"
                >
                  ×
                </button>
              </div>
            ))}
            {photos.length === 0 && (
              <p className="col-span-3 text-xs text-muted">No photos yet.</p>
            )}
          </div>
          <input
            ref={photoInput}
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => upload(event.target.files, "photo")}
            className="mt-3 block w-full text-xs text-muted file:mr-3 file:rounded-full file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-xs file:text-white"
          />
        </div>
      </div>

      {busy && <p className="mt-4 text-xs text-muted">Uploading {busy}…</p>}
      <p className="mt-4 text-xs text-muted">
        Uploads go straight to Supabase Storage. Changes save automatically.
      </p>
    </section>
  );
}

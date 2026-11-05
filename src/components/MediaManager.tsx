"use client";

import { useRef, useState, useTransition } from "react";
import { updateMediaAction } from "@/lib/actions/businesses";
import { MEDIA_BUCKET, bannerSource, mediaUrl } from "@/lib/media";
import { createClient } from "@/lib/supabase/client";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 15 * 1024 * 1024;
const VIDEO_TYPES = ["video/mp4", "video/webm"];

type MediaState = {
  logoPath: string | null;
  photoPaths: string[];
  videoPath: string | null;
  videoPosterPath: string | null;
  bannerPath: string | null;
};

export function MediaManager(props: {
  businessId: string;
  logoPath: string | null;
  photoPaths: string[];
  videoPath?: string | null;
  videoPosterPath?: string | null;
  bannerPath?: string | null;
}) {
  const [media, setMedia] = useState<MediaState>({
    logoPath: props.logoPath,
    photoPaths: props.photoPaths,
    videoPath: props.videoPath ?? null,
    videoPosterPath: props.videoPosterPath ?? null,
    bannerPath: props.bannerPath ?? null,
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const logoInput = useRef<HTMLInputElement>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const posterInput = useRef<HTMLInputElement>(null);
  const bannerInput = useRef<HTMLInputElement>(null);

  function persist(next: MediaState) {
    setMedia(next);
    startTransition(async () => {
      await updateMediaAction(props.businessId, next);
    });
  }

  async function store(file: File, prefix: string): Promise<string | null> {
    const supabase = createClient();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-48);
    const path = `${props.businessId}/${prefix}-${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      setError(uploadError.message);
      return null;
    }
    return path;
  }

  async function drop(path: string) {
    const supabase = createClient();
    await supabase.storage.from(MEDIA_BUCKET).remove([path]);
  }

  async function uploadImage(files: FileList | null, kind: "logo" | "photo") {
    if (!files || files.length === 0) return;
    setError(null);

    let next = { ...media };
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        setError(`${file.name} is not an image.`);
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setError(`${file.name} is larger than 5MB.`);
        continue;
      }

      setBusy(file.name);
      const path = await store(file, kind);
      if (!path) continue;

      if (kind === "logo") {
        if (next.logoPath) await drop(next.logoPath);
        next = { ...next, logoPath: path };
      } else {
        next = { ...next, photoPaths: [...next.photoPaths, path].slice(0, 6) };
      }
    }

    setBusy(null);
    persist(next);
    if (logoInput.current) logoInput.current.value = "";
    if (photoInput.current) photoInput.current.value = "";
  }

  async function uploadVideo(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setError(null);

    if (!VIDEO_TYPES.includes(file.type)) {
      setError("Video must be MP4 or WebM.");
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setError(`${file.name} is larger than 15MB.`);
      return;
    }

    setBusy(file.name);
    const path = await store(file, "video");
    setBusy(null);
    if (!path) return;

    if (media.videoPath) await drop(media.videoPath);
    persist({ ...media, videoPath: path });
    if (videoInput.current) videoInput.current.value = "";
  }

  async function uploadPoster(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Poster must be an image.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(`${file.name} is larger than 5MB.`);
      return;
    }

    setBusy(file.name);
    const path = await store(file, "video-poster");
    setBusy(null);
    if (!path) return;

    if (media.videoPosterPath) await drop(media.videoPosterPath);
    persist({ ...media, videoPosterPath: path });
    if (posterInput.current) posterInput.current.value = "";
  }

  async function uploadBanner(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Banner must be an image.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(`${file.name} is larger than 5MB.`);
      return;
    }

    setBusy(file.name);
    const path = await store(file, "banner");
    setBusy(null);
    if (!path) return;

    if (media.bannerPath) await drop(media.bannerPath);
    persist({ ...media, bannerPath: path });
    if (bannerInput.current) bannerInput.current.value = "";
  }

  async function removeMedia(path: string, kind: "logo" | "photo" | "video" | "poster" | "banner") {
    setError(null);
    await drop(path);

    if (kind === "logo") persist({ ...media, logoPath: null });
    else if (kind === "photo") persist({ ...media, photoPaths: media.photoPaths.filter((p) => p !== path) });
    else if (kind === "video") {
      if (media.videoPosterPath) await drop(media.videoPosterPath);
      persist({ ...media, videoPath: null, videoPosterPath: null });
    } else if (kind === "banner") persist({ ...media, bannerPath: null });
    else persist({ ...media, videoPosterPath: null });
  }

  const videoUrl = mediaUrl(media.videoPath);
  const posterUrl = mediaUrl(media.videoPosterPath);
  const effectiveBanner = mediaUrl(media.bannerPath) ?? mediaUrl(media.photoPaths[0]);
  const bannerKind = bannerSource(media);

  return (
    <section className="space-y-8 rounded-2xl border border-line bg-surface p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-lg text-ink">Media</h2>
        <p className="text-xs text-muted">
          Images: JPG, PNG, WebP · max 5MB. Video: MP4/WebM · max 15MB, 30 seconds.
        </p>
      </div>

      {error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-ink">Logo</p>
          <div className="mt-2 flex h-28 w-28 items-center justify-center overflow-hidden rounded-xl border border-line bg-paper">
            {media.logoPath ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrl(media.logoPath) ?? ""} alt="Business logo" className="h-full w-full object-contain p-2" />
            ) : (
              <span className="text-xs text-muted">No logo</span>
            )}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <input
              ref={logoInput}
              type="file"
              accept="image/*"
              onChange={(event) => uploadImage(event.target.files, "logo")}
              className="block w-full text-xs text-muted file:mr-3 file:rounded-full file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-xs file:text-white"
            />
            {media.logoPath && (
              <button
                type="button"
                onClick={() => removeMedia(media.logoPath!, "logo")}
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
            {media.photoPaths.map((path) => (
              <div key={path} className="group relative overflow-hidden rounded-lg border border-line bg-paper">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mediaUrl(path) ?? ""} alt="Business photo" className="h-20 w-full object-cover" />
                {media.bannerPath === path && (
                  <span className="absolute left-1 top-1 rounded-full bg-brand px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-white">
                    Banner
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(path, "photo")}
                  className="absolute right-1 top-1 rounded-full bg-white/90 px-1.5 text-[10px] text-brand opacity-0 transition-opacity group-hover:opacity-100"
                >
                  ×
                </button>
                {media.bannerPath !== path && (
                  <button
                    type="button"
                    onClick={() => persist({ ...media, bannerPath: path })}
                    className="absolute inset-x-0 bottom-0 bg-white/90 px-1 py-0.5 text-[9px] font-medium text-brand opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    Use as banner
                  </button>
                )}
              </div>
            ))}
            {media.photoPaths.length === 0 && (
              <p className="col-span-3 text-xs text-muted">No photos yet.</p>
            )}
          </div>
          <input
            ref={photoInput}
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => uploadImage(event.target.files, "photo")}
            className="mt-3 block w-full text-xs text-muted file:mr-3 file:rounded-full file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-xs file:text-white"
          />
        </div>
      </div>

      <div className="border-t border-line pt-6">
        <p className="text-sm font-medium text-ink">Banner creative</p>
        <p className="mt-1 text-xs text-muted">
          This is what fills the carousel on the home page and the overlay. 1600 × 600 px (8:3),
          JPG/PNG/WebP, max 5MB. Without one, the carousel falls back to a compact logo + text card.
        </p>

        {effectiveBanner ? (
          <div className="mt-3 space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={effectiveBanner}
              alt="Banner creative"
              className="w-full max-w-xl rounded-xl border border-line object-cover"
            />
            <p className="text-xs text-muted">
              In use:{" "}
              {bannerKind === "banner"
                ? "uploaded banner creative"
                : "a gallery photo (fallback) — upload a dedicated banner or mark a different photo as banner below."}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <input
                ref={bannerInput}
                type="file"
                accept="image/*"
                onChange={(event) => uploadBanner(event.target.files)}
                className="block text-xs text-muted file:mr-3 file:rounded-full file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-xs file:text-white"
              />
              {media.bannerPath && (
                <button
                  type="button"
                  onClick={() => removeMedia(media.bannerPath!, "banner")}
                  className="text-xs text-rose-600 hover:text-rose-700"
                >
                  Remove banner
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
            <p className="mt-2 text-xs text-muted">
              No banner and no photos yet — the carousel shows a compact card until one is added.
            </p>
            <input
              ref={bannerInput}
              type="file"
              accept="image/*"
              onChange={(event) => uploadBanner(event.target.files)}
              className="mt-3 block w-full text-xs text-muted file:mr-3 file:rounded-full file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-xs file:text-white"
            />
          </div>
        )}
      </div>

      <div className="border-t border-line pt-6">
        <p className="text-sm font-medium text-ink">Short video (optional)</p>
        <p className="mt-1 text-xs text-muted">
          One clip per business. MP4 (H.264) or WebM, max 15MB, 30 seconds, 1080p. Keep it short —
          video counts against storage and bandwidth.
        </p>

        {videoUrl ? (
          <div className="mt-3 space-y-3">
            <video
              src={videoUrl}
              poster={posterUrl ?? undefined}
              controls
              preload="metadata"
              className="w-full max-w-md rounded-xl border border-line bg-black"
            />
            <div className="flex flex-wrap items-center gap-4">
              <input
                ref={videoInput}
                type="file"
                accept="video/mp4,video/webm"
                onChange={(event) => uploadVideo(event.target.files)}
                className="block text-xs text-muted file:mr-3 file:rounded-full file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-xs file:text-white"
              />
              <button
                type="button"
                onClick={() => removeMedia(media.videoPath!, "video")}
                className="text-xs text-rose-600 hover:text-rose-700"
              >
                Remove video
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={posterInput}
                type="file"
                accept="image/*"
                onChange={(event) => uploadPoster(event.target.files)}
                className="block text-xs text-muted file:mr-3 file:rounded-full file:border-0 file:border-line file:bg-paper file:px-3 file:py-1.5 file:text-xs file:text-ink"
              />
              <span className="text-xs text-muted">
                {media.videoPosterPath ? "Poster set" : "Optional poster frame"}
              </span>
              {media.videoPosterPath && (
                <button
                  type="button"
                  onClick={() => removeMedia(media.videoPosterPath!, "poster")}
                  className="text-xs text-brand hover:text-brand-ink"
                >
                  Remove poster
                </button>
              )}
            </div>
          </div>
        ) : (
          <input
            ref={videoInput}
            type="file"
            accept="video/mp4,video/webm"
            onChange={(event) => uploadVideo(event.target.files)}
            className="mt-3 block w-full text-xs text-muted file:mr-3 file:rounded-full file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-xs file:text-white"
          />
        )}
      </div>

      {busy && <p className="text-xs text-muted">Uploading {busy}…</p>}
      <p className="text-xs text-muted">
        Files are uploaded securely and saved automatically.
      </p>
    </section>
  );
}

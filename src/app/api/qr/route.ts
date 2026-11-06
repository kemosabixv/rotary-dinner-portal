import QRCode from "qrcode";

/**
 * Generates a print-quality SVG QR code for a path on the current host.
 *
 * `path` must be site-relative (e.g. /businesses/acme) so the code always
 * points at whatever host is serving this request — no stale vercel.app URLs
 * baked into printed cards.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path") ?? "/businesses";
  const sizeParam = Number(searchParams.get("size") ?? 600);
  const size = Math.min(1200, Math.max(200, Number.isFinite(sizeParam) ? sizeParam : 600));
  const download = searchParams.get("download") === "1";

  if (!path.startsWith("/") || path.startsWith("//")) {
    return new Response("Invalid path", { status: 400 });
  }

  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "localhost:3000";
  const proto =
    request.headers.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const target = `${proto}://${host}${path}`;

  const svg = await QRCode.toString(target, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 2,
    width: size,
    color: { dark: "#0b1b3a", light: "#ffffff" },
  });

  const slug = path.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "") || "portal";

  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
      ...(download
        ? { "content-disposition": `attachment; filename="qr-${slug}.svg"` }
        : {}),
    },
  });
}

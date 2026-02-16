import type { Metadata } from "next";

export const SITE_URL = "http://localhost:3000";

export const DEFAULT = {
  title: "PIEE — The Universal Creative Command Palette",
  description:
    "Search. Create. Reuse. Everything AI starts here.",
};

export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og/default.png`;

export function absolute(path?: string) {
  if (!path) return DEFAULT_OG_IMAGE;
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path}`;
}

export const ROUTE_META: Record<
  string,
  Partial<Metadata> & { ogImage?: string }
> = {
  "/dashboard": {
    title: "Dashboard — PIEE",
    description: "Your creative workflow hub and activity overview.",
    ogImage: "/images/og/dashboard.png",
  },

  "/tools/image/compress": {
    title: "Image Compressor — PIEE",
    description: "Compress images locally with no uploads or tracking.",
    ogImage: "/images/og/image-compress.png",
  },

  "/instagram/reel-downloader": {
    title: "Instagram Reel Downloader — PIEE",
    description: "Download reels safely and privately.",
    ogImage: "/images/og/instagram-reels.png",
  },
};

export function toPlainTitle(input: Metadata["title"]): string {
  if (!input) return "";
  if (typeof input === "string") return input;

  if (typeof input === "object") {
    if ("absolute" in input && input.absolute) return input.absolute;
    if ("default" in input && input.default) return input.default;
  }

  return String(input);
}

/**
 * Static route metadata — always safe for <head>
 */
export function buildMetadataForRoute(path: string): Metadata {
  const route = decodeURIComponent(path);
  const override = ROUTE_META[route] ?? {};

  const title = toPlainTitle(override.title ?? DEFAULT.title);
  const description = override.description ?? DEFAULT.description;

  const ogImage = absolute(
    override.ogImage ?? `/api/og?path=${encodeURIComponent(route)}`
  );

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),

    openGraph: {
      title,
      description,
      url: `${SITE_URL}${route}`,
      type: "website",
      images: [ogImage],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

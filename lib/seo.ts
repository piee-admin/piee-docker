import type { Metadata } from "next";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://piee.app"
    : "http://localhost:3000");

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

  "/library/prompt": {
    title: "Prompt Library — PIEE",
    description: "Your creative workflow hub and activity overview.",
    ogImage: "/images/og/prompt-list.png",
  },

  "/library": {
    title: "Library — PIEE",
    description: "Browse prompts, media tools, and workflows.",
    ogImage: "/images/og/library.png",
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
 * Optional — fetch prompt details server-side
 * (do this inside generateMetadata, not in the helper)
 */
export async function fetchPromptMeta(idOrSlug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASEURL}/library/prompts/${idOrSlug}`,
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error("Prompt not found");
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * 🔒 Always returns a deterministic, serializable Metadata object
 * 👉 This guarantees OG + Twitter meta render in <head>
 */
export function buildPromptMetadata(opts: {
  id?: string;
  prompt?: { title?: string; description?: string; coverImage?: string };
} = {}): Metadata {
  const safeId = typeof opts.id === "string" ? opts.id : "";

  const title =
    opts.prompt?.title ??
    (safeId ? `Prompt — ${safeId.slice(0, 6)}…` : DEFAULT.title);

  const description =
    opts.prompt?.description ??
    "View prompt details, metadata, and usage insights.";

  const ogImage =
    absolute(
      opts.prompt?.coverImage ??
        `/api/og/prompt?id=${encodeURIComponent(safeId)}`
    ) || DEFAULT_OG_IMAGE;

  const url = safeId
    ? `${SITE_URL}/library/prompt/${safeId}`
    : `${SITE_URL}/library/prompt`;

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),

    openGraph: {
      title,
      description,
      url,
      siteName: "PIEE",
      type: "article",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
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

import type { Metadata } from "next";

export const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.NODE_ENV === "production"
        ? "https://piee.app"
        : "http://localhost:3000");

export const DEFAULT = {
    title: "PIEE — The Universal Creative Command Palette",
    description:
        "Compress images, trim videos, and format code with a single shortcut.",
};

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

    if (typeof input === "string") {
        return input;
    }

    // template objects created by Next metadata
    if (typeof input === "object") {
        if ("absolute" in input && input.absolute) return input.absolute;
        if ("default" in input && input.default) return input.default;
    }

    // fallback
    return String(input);
}

export async function fetchPromptMeta(idOrSlug: string) {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASEURL}/library/prompts/${idOrSlug}`,
            { cache: "no-store" }
        );

        if (!res.ok) throw new Error("Prompt not found");

        const data = await res.json();
        return data;
    } catch {
        return null;
    }
}
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og/default.png`;

export function absolute(path?: string) {
    if (!path) return DEFAULT_OG_IMAGE;
    if (path.startsWith("http")) return path;
    return `${SITE_URL}${path}`;
}

export async function buildPromptMetadata(id?: string): Promise<Metadata> {
    const safeId = typeof id === "string" ? id : "";

    // Try fetching prompt details
    const prompt = safeId ? await fetchPromptMeta(safeId) : null;


    const title =
        prompt?.title ??
        (safeId ? `Prompt — ${safeId.slice(0, 6)}…` : DEFAULT.title);

    const description =
        prompt?.description ??
        "View prompt details, metadata, and usage insights.";

    const ogImage = `${SITE_URL}/api/og/prompt?id=${safeId}`;

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

export function buildMetadataForRoute(path: string): Metadata {
    const route = decodeURIComponent(path);
    const override = ROUTE_META[route] ?? {};

    const title = toPlainTitle(override.title ?? DEFAULT.title);
    const description = override.description ?? DEFAULT.description;

    const ogImage = `${SITE_URL}/api/og?path=${encodeURIComponent(route)}`;

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
import { ImageResponse } from "next/og";
import { ROUTE_META, SITE_URL, DEFAULT_OG_IMAGE } from "@/lib/seo";

export const runtime = "edge";

function absolute(path?: string) {
  if (!path) return DEFAULT_OG_IMAGE;
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path}`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const raw = searchParams.get("path") || "/";
  const path = decodeURIComponent(raw);

  const image = absolute(
    ROUTE_META[path]?.ogImage || DEFAULT_OG_IMAGE
  );

  return new ImageResponse(
    <img
      src={image}
      width={1200}
      height={630}
      style={{
        objectFit: "cover",
        width: "100%",
        height: "100%",
      }}
    />,
    {
      width: 1200,
      height: 630,
    }
  );
}

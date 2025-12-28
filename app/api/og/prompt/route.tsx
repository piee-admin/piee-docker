import { ImageResponse } from "next/og";

export const runtime = "edge";

const API_BASE = `${process.env.NEXT_PUBLIC_BASEURL}/library/prompts`;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Missing id", { status: 400 });
  }

  // Fetch prompt details
  const res = await fetch(`${API_BASE}/${id}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    return new Response("Prompt not found", { status: 404 });
  }

  const prompt = await res.json();

  const title =
    prompt?.title ??
    "Prompt";

  const subtitle = [
    prompt?.category,
    prompt?.model,
    prompt?.type
  ]
    .filter(Boolean)
    .join(" • ");

  const thumb =
    prompt?.thumbnail_url ??
    prompt?.media_url ??
    null;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "1200px",
          height: "630px",
          background: "#0B0B0F",
          color: "white",
          fontFamily: "ui-sans-serif, Inter, system-ui",
          padding: "40px",
        }}
      >

        {/* Thumbnail */}
        {thumb && (
          <img
            src={thumb}
            width={420}
            height={550}
            style={{
              borderRadius: "16px",
              objectFit: "cover",
            }}
          />
        )}

        {/* Text block */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginLeft: "40px",
            gap: "20px",
          }}
        >
          <div
            style={{
              fontSize: "44px",
              fontWeight: 800,
              lineHeight: "1.1",
              maxWidth: "650px",
            }}
          >
            {title}
          </div>

          <div
            style={{
              fontSize: "26px",
              opacity: 0.8,
            }}
          >
            {subtitle || "PIEE Prompt"}
          </div>

          <div
            style={{
              marginTop: "auto",
              fontSize: "22px",
              opacity: 0.6,
            }}
          >
            piee.app • Prompt Library
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

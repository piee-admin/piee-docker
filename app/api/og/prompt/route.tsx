import { ImageResponse } from "next/og";

export const runtime = "edge";

const API_BASE = `${process.env.NEXT_PUBLIC_BASEURL}/library/prompts`;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return new Response("Missing id", { status: 400 });

  const res = await fetch(`${API_BASE}/${id}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) return new Response("Prompt not found", { status: 404 });

  const prompt = await res.json();

  const title = prompt?.title ?? "Prompt";

  const meta = [
    { label: prompt?.category, kind: "category" },
    { label: prompt?.model, kind: "model" },
    { label: prompt?.type, kind: "type" },
  ].filter(m => Boolean(m.label));

  const thumb =
    prompt?.thumbnail_url ??
    prompt?.media_url ??
    null;

  //
  // Minimal Lucide-style inline icons (OG safe)
  //
// do NOT type JSX elements in next/og edge runtime
const Icons: Record<string, any> = {
  category: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 13v4"/><path d="M15 5v4"/><path d="M3 3v16a2 2 0 0 0 2 2h16"/><rect x="7" y="13" width="9" height="4" rx="1"/><rect x="7" y="5" width="12" height="4" rx="1"/></svg>
  ),

  model: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M9 13a4.5 4.5 0 0 0 3-4"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M12 13h4"/><path d="M12 18h6a2 2 0 0 1 2 2v1"/><path d="M12 8h8"/><path d="M16 8V5a2 2 0 0 1 2-2"/><circle cx="16" cy="13" r=".5"/><circle cx="18" cy="3" r=".5"/><circle cx="20" cy="21" r=".5"/><circle cx="20" cy="8" r=".5"/></svg>
  ),

  type: (
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/></svg>
  ),
};


  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: 1200,
          height: 630,
          background: "#0C0C0E",
          color: "#F2F2F3",
          fontFamily: "Inter, ui-sans-serif, system-ui",
          padding: 52,
        }}
      >
        {/* Thumbnail */}
        {thumb ? (
          <div
            style={{
              display: "flex",
              width: 430,
              height: 560,
              borderRadius: 20,
              overflow: "hidden",
              background: "#111114",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <img
              src={thumb}
              width={430}
              height={560}
              style={{ objectFit: "cover" }}
            />
          </div>
        ) : null}

        {/* Text Column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginLeft: 44,
            gap: 22,
            flex: 1,
          }}
        >
          {/* Title */}
          <div
            style={{
              display: "flex",
              fontSize: 68,
              fontWeight: 900,
              lineHeight: 1.16,
              letterSpacing: "-0.5px",
              maxWidth: 720,
            }}
          >
            {title}
          </div>

          {/* Meta Pills with Icons */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            {meta.length
              ? meta.map((m, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 14px",
                      borderRadius: 12,
                      fontSize: 26,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      opacity: 0.92,
                    }}
                  >
                    {Icons[m.kind]}
                    <span>{m.label}</span>
                  </div>
                ))
              : (
                <div
                  style={{
                    display: "flex",
                    padding: "10px 14px",
                    borderRadius: 12,
                    fontSize: 26,
                    opacity: 0.9,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  PIEE Prompt
                </div>
              )}
          </div>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              marginTop: "auto",
              width: "100%",
              height: 1,
              background: "rgba(255,255,255,0.1)",
            }}
          />

          {/* Footer */}
          <div
            style={{
              display: "flex",
              gap: 8,
              fontSize: 26,
              opacity: 0.88,
            }}
          >
            <span style={{ fontWeight: 800 }}>PIEE</span>
            <span>• Prompt Library</span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

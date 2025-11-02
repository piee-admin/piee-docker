export const runtime = "edge";

export async function GET() {
  const image = await fetch(
    new URL("../../../public/images/ogtagimage.png", import.meta.url)
  ).then((res) => res.arrayBuffer());

  return new Response(image, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json();

  const token = req.headers.get("authorization") || "";

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASEURL}/upload/complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token,
    },
    body: JSON.stringify(body),
  });

  return new Response(await res.text(), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

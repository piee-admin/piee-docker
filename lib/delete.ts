export async function deleteFileFromFastAPI(fileId: string, token?: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASEURL}/upload/${fileId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Delete failed: ${res.status} ${txt}`);
  }

  return await res.json();
}
// lib/upload.ts
export async function uploadFileToFastAPI(file: File, token?: string) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASEURL}/upload/`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Upload failed: ${res.status} ${txt}`);
  }

  return await res.json();
}

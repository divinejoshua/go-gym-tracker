/**
 * Sends camera output to our own route handler, which does the actual Supabase
 * upload. Keeping this out of the browser means no Supabase credential ships in
 * the client bundle.
 */
export async function uploadProof(file: File): Promise<string> {
  const body = new FormData();
  body.set("file", file);

  const response = await fetch("/api/upload", { method: "POST", body });

  const payload: { url?: string; error?: string } = await response
    .json()
    .catch(() => ({}));

  if (!response.ok || !payload.url) {
    throw new Error(payload.error ?? "Upload failed. Check your connection and retry.");
  }

  return payload.url;
}

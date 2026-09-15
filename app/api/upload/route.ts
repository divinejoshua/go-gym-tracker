import { NextResponse } from "next/server";

import { getSupabase, PROOF_BUCKET } from "@/lib/supabase";

/** 50MB — above a 30s phone clip, below Supabase's default object limit. */
const MAX_BYTES = 50 * 1024 * 1024;

/**
 * Receives camera output and forwards it to Supabase Storage.
 *
 * The browser can't upload directly because the only Supabase credential this
 * app holds is the service role key, which must never reach the client. Routing
 * the bytes through here keeps the key server-side.
 */
export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected a file upload." }, { status: 400 });
  }

  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file was uploaded." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "That clip is too big. Record a shorter video." },
      { status: 413 },
    );
  }

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");

  if (!isImage && !isVideo) {
    return NextResponse.json(
      { error: "Only photos and videos can be used as proof." },
      { status: 415 },
    );
  }

  // Derive the extension from the MIME type rather than trusting the filename.
  const extension = file.type.split("/")[1]?.split(";")[0] ?? (isImage ? "jpg" : "webm");
  const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;

  const supabase = getSupabase();

  const { error } = await supabase.storage
    .from(PROOF_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    return NextResponse.json(
      {
        error: `Upload failed: ${error.message}. Check that the "${PROOF_BUCKET}" storage bucket exists.`,
      },
      { status: 500 },
    );
  }

  const { data } = supabase.storage.from(PROOF_BUCKET).getPublicUrl(path);

  return NextResponse.json({ url: data.publicUrl, type: isImage ? "image" : "video" });
}

import { createClient } from "@/lib/supabase/client";

/**
 * Uploads a file to a Supabase Storage bucket and returns its public URL.
 * @param file   - The File object to upload.
 * @param bucket - The Storage bucket name (e.g. "avatars", "waste-images").
 * @param path   - The storage path including file name (e.g. "user-id/avatar.png").
 */
export async function uploadImage(
  file: File,
  bucket: string,
  path: string,
): Promise<string> {
  const supabase = createClient();

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

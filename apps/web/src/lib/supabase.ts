import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client with service role key (for storage uploads)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Storage bucket name
export const LISTING_IMAGES_BUCKET = "listing-images";

// Get public URL for a file in the listing-images bucket
export function getPublicImageUrl(path: string): string {
  const { data } = supabaseAdmin.storage
    .from(LISTING_IMAGES_BUCKET)
    .getPublicUrl(path);
  return data.publicUrl;
}

// Upload a file to the listing-images bucket
export async function uploadImage(
  file: Buffer,
  path: string,
  contentType: string
): Promise<{ url: string; path: string } | { error: string }> {
  const { data, error } = await supabaseAdmin.storage
    .from(LISTING_IMAGES_BUCKET)
    .upload(path, file, {
      contentType,
      upsert: false,
    });

  if (error) {
    console.error("[Supabase Storage] Upload error:", error);
    return { error: error.message };
  }

  const url = getPublicImageUrl(data.path);
  return { url, path: data.path };
}

// Delete a file from the listing-images bucket
export async function deleteImage(path: string): Promise<boolean> {
  const { error } = await supabaseAdmin.storage
    .from(LISTING_IMAGES_BUCKET)
    .remove([path]);

  if (error) {
    console.error("[Supabase Storage] Delete error:", error);
    return false;
  }

  return true;
}

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lazy-loaded Supabase client to avoid build-time errors
let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (_supabaseAdmin) return _supabaseAdmin;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase URL and Service Key are required");
  }

  _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _supabaseAdmin;
}

// Storage bucket name
export const LISTING_IMAGES_BUCKET = "listing-images";

// Get public URL for a file in the listing-images bucket
export function getPublicImageUrl(path: string): string {
  const { data } = getSupabaseAdmin().storage
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
  const { data, error } = await getSupabaseAdmin().storage
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
  const { error } = await getSupabaseAdmin().storage
    .from(LISTING_IMAGES_BUCKET)
    .remove([path]);

  if (error) {
    console.error("[Supabase Storage] Delete error:", error);
    return false;
  }

  return true;
}

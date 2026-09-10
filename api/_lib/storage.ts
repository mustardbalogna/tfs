import { getSupabaseClient } from "./supabase.js";

export const CATEGORY_IMAGES_BUCKET = "category-images";
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
// Kept modest because images are transported as base64 JSON (~33% larger than
// the original file), which must fit under the serverless function body limit.
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export function getPublicImageUrl(storagePath: string): string {
  const supabase = getSupabaseClient();
  return supabase.storage.from(CATEGORY_IMAGES_BUCKET).getPublicUrl(storagePath).data.publicUrl;
}

export async function uploadCategoryImage(
  storagePath: string,
  buffer: Buffer,
  contentType: string,
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.storage
    .from(CATEGORY_IMAGES_BUCKET)
    .upload(storagePath, buffer, { contentType, upsert: false });
  if (error) throw error;
}

export async function deleteCategoryImages(storagePaths: string[]): Promise<void> {
  if (storagePaths.length === 0) return;
  const supabase = getSupabaseClient();
  const { error } = await supabase.storage.from(CATEGORY_IMAGES_BUCKET).remove(storagePaths);
  if (error) throw error;
}

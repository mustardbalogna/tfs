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

// Site media --------------------------------------------------------------
// General-purpose images placed on pages through the visual editor (hero
// backgrounds, card photos, galleries). Separate bucket so category galleries
// and page media can be managed independently.
export const SITE_MEDIA_BUCKET = "site-media";

export interface MediaObject {
  path: string;
  url: string;
  name: string;
  size: number;
  createdAt: string;
}

export function getMediaUrl(storagePath: string): string {
  const supabase = getSupabaseClient();
  return supabase.storage.from(SITE_MEDIA_BUCKET).getPublicUrl(storagePath).data.publicUrl;
}

export async function uploadMedia(
  storagePath: string,
  buffer: Buffer,
  contentType: string,
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.storage
    .from(SITE_MEDIA_BUCKET)
    .upload(storagePath, buffer, { contentType, upsert: false });
  if (error) throw error;
}

export async function deleteMedia(storagePath: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.storage.from(SITE_MEDIA_BUCKET).remove([storagePath]);
  if (error) throw error;
}

export async function listMedia(limit = 200): Promise<MediaObject[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.storage
    .from(SITE_MEDIA_BUCKET)
    .list("", { limit, sortBy: { column: "created_at", order: "desc" } });
  if (error) throw error;
  return (data ?? [])
    .filter((o) => o.name && !o.name.startsWith("."))
    .map((o) => ({
      path: o.name,
      url: getMediaUrl(o.name),
      // Strip the uuid prefix added on upload so the library shows the original name.
      name: o.name.replace(/^[0-9a-f-]{36}-/, ""),
      size: (o.metadata as { size?: number } | null)?.size ?? 0,
      createdAt: o.created_at ?? "",
    }));
}

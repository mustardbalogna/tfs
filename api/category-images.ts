import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "node:crypto";
import { getSupabaseClient } from "./_lib/supabase.js";
import { requireAdmin } from "./_lib/auth.js";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  getPublicImageUrl,
  uploadCategoryImage,
  deleteCategoryImages,
} from "./_lib/storage.js";

function sanitizeFileName(name: string): string {
  const base = name.split(/[/\\]/).pop() || "image";
  return base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabase = getSupabaseClient();

  if (req.method === "POST") {
    if (!(await requireAdmin(req, res, "category-images-write"))) return;

    const { categoryId, fileName, contentType, dataBase64 } = req.body ?? {};
    if (typeof categoryId !== "string" || !categoryId) {
      return res.status(400).json({ error: "Category id is required" });
    }
    if (typeof contentType !== "string" || !ALLOWED_IMAGE_TYPES.includes(contentType)) {
      return res.status(400).json({ error: "Only JPG, PNG and WebP images are allowed" });
    }
    if (typeof dataBase64 !== "string" || !dataBase64) {
      return res.status(400).json({ error: "Image data is required" });
    }

    let buffer: Buffer;
    try {
      buffer = Buffer.from(dataBase64, "base64");
    } catch {
      return res.status(400).json({ error: "Invalid image data" });
    }
    if (buffer.length === 0 || buffer.length > MAX_IMAGE_BYTES) {
      return res.status(400).json({
        error: `Images must be ${Math.round(MAX_IMAGE_BYTES / (1024 * 1024))}MB or smaller`,
      });
    }

    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("id", categoryId)
      .maybeSingle();
    if (categoryError) {
      console.error("Failed to look up category", categoryError);
      return res.status(500).json({ error: "Failed to upload image" });
    }
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const safeName = sanitizeFileName(typeof fileName === "string" ? fileName : "image");
    const storagePath = `${categoryId}/${crypto.randomUUID()}-${safeName}`;

    try {
      await uploadCategoryImage(storagePath, buffer, contentType);
    } catch (err) {
      console.error("Failed to upload image to storage", err);
      return res.status(500).json({ error: "Failed to upload image. Please try again." });
    }

    const { data: existing, error: maxError } = await supabase
      .from("category_images")
      .select("sort_order")
      .eq("category_id", categoryId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (maxError) {
      console.error("Failed to determine image order", maxError);
      // Clean up the orphaned storage object since we can't record it.
      await deleteCategoryImages([storagePath]).catch(() => {});
      return res.status(500).json({ error: "Failed to upload image. Please try again." });
    }
    const nextOrder = existing ? existing.sort_order + 1 : 0;

    const { data: image, error: insertError } = await supabase
      .from("category_images")
      .insert({ category_id: categoryId, storage_path: storagePath, sort_order: nextOrder })
      .select()
      .single();
    if (insertError) {
      console.error("Failed to save image record", insertError);
      // Don't save a category with a broken/incomplete image reference.
      await deleteCategoryImages([storagePath]).catch(() => {});
      return res.status(500).json({ error: "Failed to upload image. Please try again." });
    }

    return res.status(201).json({
      image: { id: image.id, sortOrder: image.sort_order, url: getPublicImageUrl(storagePath) },
    });
  }

  if (req.method === "PATCH") {
    if (!(await requireAdmin(req, res, "category-images-write"))) return;

    const { categoryId, order } = req.body ?? {};
    if (typeof categoryId !== "string" || !categoryId) {
      return res.status(400).json({ error: "Category id is required" });
    }
    if (!Array.isArray(order) || order.some((id) => typeof id !== "string")) {
      return res.status(400).json({ error: "A valid image order list is required" });
    }

    const { data: existingImages, error: existingError } = await supabase
      .from("category_images")
      .select("id")
      .eq("category_id", categoryId);
    if (existingError) {
      console.error("Failed to load images for reorder", existingError);
      return res.status(500).json({ error: "Failed to reorder images" });
    }
    const existingIds = new Set((existingImages ?? []).map((img) => img.id));
    const requestedIds = new Set(order);
    if (
      existingIds.size !== requestedIds.size ||
      [...existingIds].some((id) => !requestedIds.has(id))
    ) {
      return res
        .status(400)
        .json({ error: "The provided image order does not match this category" });
    }

    try {
      await Promise.all(
        (order as string[]).map((id, index) =>
          supabase
            .from("category_images")
            .update({ sort_order: index })
            .eq("id", id)
            .then(({ error }) => {
              if (error) throw error;
            }),
        ),
      );
    } catch (err) {
      console.error("Failed to reorder images", err);
      return res.status(500).json({ error: "Failed to reorder images" });
    }

    return res.status(200).json({ success: true });
  }

  if (req.method === "DELETE") {
    if (!(await requireAdmin(req, res, "category-images-write"))) return;

    const { id } = req.body ?? {};
    if (typeof id !== "string" || !id) {
      return res.status(400).json({ error: "Image id is required" });
    }

    const { data: image, error: fetchError } = await supabase
      .from("category_images")
      .select("storage_path")
      .eq("id", id)
      .maybeSingle();
    if (fetchError) {
      console.error("Failed to look up image", fetchError);
      return res.status(500).json({ error: "Failed to delete image" });
    }
    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    try {
      await deleteCategoryImages([image.storage_path]);
    } catch (err) {
      console.error("Failed to remove image from storage", err);
      return res.status(500).json({ error: "Failed to delete image. Please try again." });
    }

    const { error } = await supabase.from("category_images").delete().eq("id", id);
    if (error) {
      console.error("Failed to delete image record", error);
      return res.status(500).json({ error: "Failed to delete image" });
    }

    return res.status(200).json({ success: true });
  }

  res.setHeader("Allow", "POST, PATCH, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}

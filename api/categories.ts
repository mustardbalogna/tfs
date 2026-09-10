import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabaseClient } from "./_lib/supabase.js";
import { requireAdmin } from "./_lib/auth.js";
import { getPublicImageUrl, deleteCategoryImages } from "./_lib/storage.js";
import { checkRateLimit, getClientIp } from "./_lib/rateLimit.js";

const LIMITS = { name: 100, heading: 150, description: 2000 };

interface ValidatedFields {
  name: string;
  heading: string;
  description: string;
}

function validateFields(body: Record<string, unknown>): ValidatedFields | { error: string } {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const heading = typeof body.heading === "string" ? body.heading.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";

  if (!name) return { error: "Category name is required" };
  if (name.length > LIMITS.name) {
    return { error: `Category name must be ${LIMITS.name} characters or fewer` };
  }
  if (!heading) return { error: "Heading is required" };
  if (heading.length > LIMITS.heading) {
    return { error: `Heading must be ${LIMITS.heading} characters or fewer` };
  }
  if (!description) return { error: "Description is required" };
  if (description.length > LIMITS.description) {
    return { error: `Description must be ${LIMITS.description} characters or fewer` };
  }

  return { name, heading, description };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabase = getSupabaseClient();

  if (req.method === "GET") {
    // Public endpoint (the published site reads categories from here), but
    // still rate-limited to deter abuse.
    const { limited, retryAfterSeconds } = await checkRateLimit(
      `categories-read:${getClientIp(req)}`,
      300,
      60 * 1000,
    );
    if (limited) {
      res.setHeader("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({ error: "Too many requests. Please slow down." });
    }

    const { data, error } = await supabase
      .from("categories")
      .select(
        "id, name, heading, description, created_at, updated_at, category_images(id, storage_path, sort_order)",
      )
      .order("created_at", { ascending: true });
    if (error) {
      console.error("Failed to load categories", error);
      return res.status(500).json({ error: "Failed to load categories" });
    }

    interface Row {
      id: string;
      name: string;
      heading: string;
      description: string;
      created_at: string;
      updated_at: string;
      category_images: { id: string; storage_path: string; sort_order: number }[] | null;
    }

    const categories = ((data ?? []) as Row[]).map((c) => ({
      id: c.id,
      name: c.name,
      heading: c.heading,
      description: c.description,
      created_at: c.created_at,
      updated_at: c.updated_at,
      images: (c.category_images ?? [])
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((img) => ({
          id: img.id,
          sortOrder: img.sort_order,
          url: getPublicImageUrl(img.storage_path),
        })),
    }));

    return res.status(200).json({ categories });
  }

  if (req.method === "POST") {
    if (!(await requireAdmin(req, res, "categories-write"))) return;

    const validated = validateFields(req.body ?? {});
    if ("error" in validated) return res.status(400).json({ error: validated.error });

    const { data, error } = await supabase.from("categories").insert(validated).select().single();
    if (error) {
      if (error.code === "23505") {
        return res.status(409).json({ error: "A category with this name already exists" });
      }
      console.error("Failed to create category", error);
      return res.status(500).json({ error: "Failed to create category" });
    }
    return res.status(201).json({ category: data });
  }

  if (req.method === "PATCH") {
    if (!(await requireAdmin(req, res, "categories-write"))) return;

    const { id } = req.body ?? {};
    if (typeof id !== "string" || !id) {
      return res.status(400).json({ error: "Category id is required" });
    }
    const validated = validateFields(req.body ?? {});
    if ("error" in validated) return res.status(400).json({ error: validated.error });

    const { data, error } = await supabase
      .from("categories")
      .update(validated)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      if (error.code === "23505") {
        return res.status(409).json({ error: "A category with this name already exists" });
      }
      console.error("Failed to update category", error);
      return res.status(500).json({ error: "Failed to update category" });
    }
    return res.status(200).json({ category: data });
  }

  if (req.method === "DELETE") {
    if (!(await requireAdmin(req, res, "categories-write"))) return;

    const { id } = req.body ?? {};
    if (typeof id !== "string" || !id) {
      return res.status(400).json({ error: "Category id is required" });
    }

    const { data: images, error: imagesError } = await supabase
      .from("category_images")
      .select("storage_path")
      .eq("category_id", id);
    if (imagesError) {
      console.error("Failed to load category images before delete", imagesError);
      return res.status(500).json({ error: "Failed to delete category" });
    }

    if (images && images.length > 0) {
      try {
        await deleteCategoryImages(images.map((img) => img.storage_path as string));
      } catch (err) {
        console.error("Failed to remove category images from storage", err);
        return res
          .status(500)
          .json({ error: "Failed to remove the category's images. Please try again." });
      }
    }

    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      console.error("Failed to delete category", error);
      return res.status(500).json({ error: "Failed to delete category" });
    }
    return res.status(200).json({ success: true });
  }

  res.setHeader("Allow", "GET, POST, PATCH, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}

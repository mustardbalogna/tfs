import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "node:crypto";
import { requireAdmin } from "./_lib/auth.js";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  deleteMedia,
  getMediaUrl,
  listMedia,
  uploadMedia,
} from "./_lib/storage.js";

// Storage object names are flat (no folders) and generated server-side, so
// anything else in a delete request is rejected outright.
const SAFE_PATH = /^[A-Za-z0-9._-]{1,180}$/;

function sanitizeFileName(name: string): string {
  const base = name.split(/[/\\]/).pop() || "image";
  return base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
}

/**
 * Media library for the visual editor. Every method requires the admin
 * session; the bucket itself is public-read so the resulting URLs can be
 * embedded directly in pages.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    if (!(await requireAdmin(req, res, "media-read", 120))) return;
    try {
      const items = await listMedia();
      return res.status(200).json({ items });
    } catch (err) {
      console.error("Failed to list media", err);
      return res.status(500).json({ error: "Failed to load media library" });
    }
  }

  if (req.method === "POST") {
    if (!(await requireAdmin(req, res, "media-write"))) return;

    const { fileName, contentType, dataBase64 } = req.body ?? {};
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

    const safeName = sanitizeFileName(typeof fileName === "string" ? fileName : "image");
    const storagePath = `${crypto.randomUUID()}-${safeName}`;

    try {
      await uploadMedia(storagePath, buffer, contentType);
    } catch (err) {
      console.error("Failed to upload media", err);
      return res.status(500).json({ error: "Failed to upload image. Please try again." });
    }

    return res.status(201).json({
      item: { path: storagePath, url: getMediaUrl(storagePath), name: safeName },
    });
  }

  if (req.method === "DELETE") {
    if (!(await requireAdmin(req, res, "media-write"))) return;

    const { path } = req.body ?? {};
    if (typeof path !== "string" || !SAFE_PATH.test(path)) {
      return res.status(400).json({ error: "A valid media path is required" });
    }
    try {
      await deleteMedia(path);
    } catch (err) {
      console.error("Failed to delete media", err);
      return res.status(500).json({ error: "Failed to delete image" });
    }
    return res.status(200).json({ success: true });
  }

  res.setHeader("Allow", "GET, POST, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}

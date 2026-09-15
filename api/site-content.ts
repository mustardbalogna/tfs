import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabaseClient } from "./_lib/supabase.js";
import { requireAdmin } from "./_lib/auth.js";
import { checkRateLimit, getClientIp } from "./_lib/rateLimit.js";

const ROW_ID = "default";
const MAX_CONTENT_CHARS = 100_000;
const MAX_DEPTH = 8;
const MAX_STRING = 5_000;
const MAX_ARRAY = 100;
const MAX_KEYS = 100;
const SAFE_KEY = /^[A-Za-z0-9_-]{1,64}$/;

/**
 * Structural sanitiser for the content document. The client owns the exact
 * shape (and re-normalises on read), so here we only guarantee that what gets
 * stored is bounded, plain JSON made of strings/numbers/booleans — no
 * prototype-polluting keys, no oversized blobs, no unexpected value types.
 * Returns null when the input can't be made safe.
 */
function sanitize(value: unknown, depth = 0): unknown | null {
  if (depth > MAX_DEPTH) return null;
  if (typeof value === "string") return value.slice(0, MAX_STRING);
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "boolean") return value;
  if (Array.isArray(value)) {
    const out: unknown[] = [];
    for (const item of value.slice(0, MAX_ARRAY)) {
      const clean = sanitize(item, depth + 1);
      if (clean === null) return null;
      out.push(clean);
    }
    return out;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length > MAX_KEYS) return null;
    for (const [key, val] of entries) {
      if (!SAFE_KEY.test(key) || key === "__proto__" || key === "constructor") return null;
      if (val === undefined) continue;
      const clean = sanitize(val, depth + 1);
      if (clean === null) return null;
      out[key] = clean;
    }
    return out;
  }
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabase = getSupabaseClient();

  if (req.method === "GET") {
    // Public endpoint (the published site reads its copy from here), but
    // still rate-limited to deter abuse.
    const { limited, retryAfterSeconds } = await checkRateLimit(
      `site-content-read:${getClientIp(req)}`,
      300,
      60 * 1000,
    );
    if (limited) {
      res.setHeader("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({ error: "Too many requests. Please slow down." });
    }

    const { data, error } = await supabase
      .from("site_content")
      .select("data")
      .eq("id", ROW_ID)
      .maybeSingle();
    if (error) {
      console.error("Failed to load site content", error);
      return res.status(500).json({ error: "Failed to load site content" });
    }

    res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=300");
    return res.status(200).json({ content: data?.data ?? null });
  }

  if (req.method === "PATCH") {
    if (!(await requireAdmin(req, res, "site-content-write"))) return;

    const content = req.body?.content;
    if (!content || typeof content !== "object" || Array.isArray(content)) {
      return res.status(400).json({ error: "content must be an object" });
    }
    if (JSON.stringify(content).length > MAX_CONTENT_CHARS) {
      return res.status(400).json({ error: "Content is too large" });
    }
    const clean = sanitize(content);
    if (!clean || typeof clean !== "object") {
      return res.status(400).json({ error: "Content contains unsupported values" });
    }

    const { error } = await supabase.from("site_content").upsert({ id: ROW_ID, data: clean });
    if (error) {
      console.error("Failed to save site content", error);
      return res.status(500).json({ error: "Failed to save site content" });
    }
    return res.status(200).json({ success: true });
  }

  res.setHeader("Allow", "GET, PATCH");
  return res.status(405).json({ error: "Method not allowed" });
}

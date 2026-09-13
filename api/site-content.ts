import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabaseClient } from "./_lib/supabase.js";
import { requireAdmin } from "./_lib/auth.js";
import { checkRateLimit, getClientIp } from "./_lib/rateLimit.js";

const ROW_ID = "default";
const MAX_CONTENT_CHARS = 50_000;

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

    const { error } = await supabase.from("site_content").upsert({ id: ROW_ID, data: content });
    if (error) {
      console.error("Failed to save site content", error);
      return res.status(500).json({ error: "Failed to save site content" });
    }
    return res.status(200).json({ success: true });
  }

  res.setHeader("Allow", "GET, PATCH");
  return res.status(405).json({ error: "Method not allowed" });
}

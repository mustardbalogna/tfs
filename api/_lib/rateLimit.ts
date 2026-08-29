import type { VercelRequest } from "@vercel/node";
import { getSupabaseClient } from "./supabase.js";

export function getClientIp(req: VercelRequest): string {
  const forwardedFor = req.headers["x-forwarded-for"];
  const first = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
  if (first) return first.split(",")[0].trim();
  return req.socket.remoteAddress || "unknown";
}

export interface RateLimitResult {
  limited: boolean;
  retryAfterSeconds: number;
}

/**
 * Fixed-window rate limit backed by Supabase so it holds across serverless
 * invocations/instances. Best-effort: concurrent requests in the same window
 * can rarely both slip through, which is an acceptable trade-off at this scale.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const supabase = getSupabaseClient();
  const now = Date.now();

  const { data } = await supabase
    .from("rate_limits")
    .select("count, window_start")
    .eq("key", key)
    .maybeSingle();

  const windowStart = data ? new Date(data.window_start).getTime() : 0;
  const windowExpired = !data || now - windowStart > windowMs;

  if (windowExpired) {
    await supabase
      .from("rate_limits")
      .upsert({ key, count: 1, window_start: new Date(now).toISOString() });
    return { limited: false, retryAfterSeconds: 0 };
  }

  const retryAfterSeconds = Math.ceil((windowStart + windowMs - now) / 1000);

  if (data.count >= limit) {
    return { limited: true, retryAfterSeconds };
  }

  await supabase
    .from("rate_limits")
    .update({ count: data.count + 1 })
    .eq("key", key);
  return { limited: false, retryAfterSeconds: 0 };
}

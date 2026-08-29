import type { VercelRequest, VercelResponse } from "@vercel/node";
import { buildClearCookie } from "./_lib/session.js";
import { checkRateLimit, getClientIp } from "./_lib/rateLimit.js";

const RATE_LIMIT = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { limited, retryAfterSeconds } = await checkRateLimit(
    `logout:${getClientIp(req)}`,
    RATE_LIMIT,
    RATE_LIMIT_WINDOW_MS,
  );
  if (limited) {
    res.setHeader("Retry-After", String(retryAfterSeconds));
    return res.status(429).json({ error: "Too many requests. Please slow down." });
  }

  res.setHeader("Set-Cookie", buildClearCookie());
  return res.status(200).json({ success: true });
}

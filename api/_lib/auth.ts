import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  readSessionCookie,
  verifySessionToken,
  createSessionToken,
  buildSessionCookie,
} from "./session.js";
import { checkRateLimit, getClientIp } from "./rateLimit.js";

/**
 * Verifies the admin session cookie, refreshes it (sliding expiry) and applies
 * a rate limit. On failure this sends the appropriate response itself and
 * returns false, so callers should just `return` when this returns false.
 */
export async function requireAdmin(
  req: VercelRequest,
  res: VercelResponse,
  rateLimitKeyPrefix: string,
  limit = 60,
  windowMs = 60 * 1000,
): Promise<boolean> {
  if (!verifySessionToken(readSessionCookie(req.headers.cookie))) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  res.setHeader("Set-Cookie", buildSessionCookie(createSessionToken()));

  const { limited, retryAfterSeconds } = await checkRateLimit(
    `${rateLimitKeyPrefix}:${getClientIp(req)}`,
    limit,
    windowMs,
  );
  if (limited) {
    res.setHeader("Retry-After", String(retryAfterSeconds));
    res.status(429).json({ error: "Too many requests. Please slow down." });
    return false;
  }
  return true;
}

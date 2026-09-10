import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Guards admin-only pages by verifying the session cookie with the server
 * before rendering. This is a UX convenience only — the API routes
 * themselves (which check the same cookie) are the real authorization
 * boundary, so direct navigation to a CMS URL can't bypass data access.
 */
export function useRequireAdmin() {
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/session");
        if (cancelled) return;
        if (!res.ok) {
          navigate("/admin/login");
          return;
        }
        setChecking(false);
      } catch {
        if (!cancelled) navigate("/admin/login");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return { checking };
}

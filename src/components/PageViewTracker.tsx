import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const VISITOR_ID_KEY = "tfs_visitor_id";
const SESSION_ID_KEY = "tfs_session_id";

function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

function getSessionId(): string {
  // sessionStorage clears when the tab/browser closes, so this naturally
  // resets per visit rather than persisting like the long-lived visitor id.
  let id = sessionStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

export default function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith("/admin")) return; // don't track the owner's own visits
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: location.pathname,
        visitorId: getVisitorId(),
        sessionId: getSessionId(),
      }),
      keepalive: true,
    }).catch(() => {});
  }, [location.pathname]);

  return null;
}

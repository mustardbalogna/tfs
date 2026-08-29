import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const VISITOR_ID_KEY = "tfs_visitor_id";

function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, id);
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
      body: JSON.stringify({ path: location.pathname, visitorId: getVisitorId() }),
      keepalive: true,
    }).catch(() => {});
  }, [location.pathname]);

  return null;
}

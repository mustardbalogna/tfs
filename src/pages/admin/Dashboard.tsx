import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  read: boolean;
  created_at: string;
}

export default function AdminDashboard() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    void loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadMessages() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/messages");
      if (res.status === 401) {
        navigate("/admin/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to load messages");
      const data = await res.json();
      setMessages(data.messages ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }

  async function markRead(id: string, read: boolean) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read } : m)));
    await fetch("/api/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, read }),
    });
  }

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    navigate("/admin/login");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-foreground">Contact Messages</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/stats">Website Stats</Link>
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </div>

      {loading && <p className="mt-6 text-muted-foreground">Loading...</p>}
      {error && <p className="mt-6 text-destructive">{error}</p>}
      {!loading && !error && messages.length === 0 && (
        <p className="mt-6 text-muted-foreground">No messages yet.</p>
      )}

      <div className="mt-6 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`rounded-xl border border-border bg-card p-6 ${m.read ? "opacity-60" : ""}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium text-foreground">{m.name}</p>
                <p className="text-sm text-muted-foreground">
                  {m.email} {m.phone ? `· ${m.phone}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {new Date(m.created_at).toLocaleString()}
                </span>
                <Button size="sm" variant="outline" asChild>
                  <a
                    href={`mailto:${m.email}?subject=${encodeURIComponent(
                      "Re: Your enquiry to Top Furniture Supplies",
                    )}`}
                  >
                    Email
                  </a>
                </Button>
                <Button size="sm" variant="outline" onClick={() => markRead(m.id, !m.read)}>
                  {m.read ? "Mark unread" : "Mark read"}
                </Button>
              </div>
            </div>
            {m.service && (
              <p className="mt-2 text-sm text-muted-foreground">Service: {m.service}</p>
            )}
            <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">{m.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

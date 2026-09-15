import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
import AdminShell, { AdminEmpty } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

type Filter = "all" | "unread";

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/messages");
        if (res.status === 401) {
          navigate("/admin/login");
          return;
        }
        if (!res.ok) throw new Error("Failed to load messages");
        const data = await res.json();
        if (!cancelled) setMessages(data.messages ?? []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load messages");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function markRead(id: string, read: boolean) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read } : m)));
    const res = await fetch("/api/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, read }),
    });
    if (!res.ok) {
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: !read } : m)));
    }
  }

  const unread = messages.filter((m) => !m.read).length;
  const visible = filter === "unread" ? messages.filter((m) => !m.read) : messages;

  return (
    <AdminShell
      title="Messages"
      description={loading ? "Loading…" : `${messages.length} total · ${unread} unread`}
      actions={
        <div className="flex items-center rounded-md border border-border bg-background p-0.5">
          {(["all", "unread"] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded px-3 py-1 text-xs font-medium capitalize transition-colors",
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      }
    >
      {error && <p className="text-sm text-destructive">{error}</p>}
      {!loading && !error && visible.length === 0 && (
        <AdminEmpty>
          {filter === "unread" ? "You're all caught up." : "No messages yet."}
        </AdminEmpty>
      )}

      <div className="space-y-3">
        {visible.map((m) => (
          <article
            key={m.id}
            className={cn(
              "rounded-xl border bg-card p-5 shadow-sm transition-colors",
              m.read ? "border-border" : "border-primary/40",
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {!m.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                  <p className="font-medium text-foreground">{m.name}</p>
                  {m.service && (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                      {m.service}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <a
                    href={`mailto:${m.email}`}
                    className="flex items-center gap-1 hover:text-primary"
                  >
                    <Mail className="h-3.5 w-3.5" /> {m.email}
                  </a>
                  {m.phone && (
                    <a
                      href={`tel:${m.phone}`}
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      <Phone className="h-3.5 w-3.5" /> {m.phone}
                    </a>
                  )}
                </div>
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
                    Reply
                  </a>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => markRead(m.id, !m.read)}>
                  {m.read ? "Mark unread" : "Mark read"}
                </Button>
              </div>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {m.message}
            </p>
          </article>
        ))}
      </div>
    </AdminShell>
  );
}

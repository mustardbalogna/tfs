import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, RotateCcw, Trash2 } from "lucide-react";
import AdminShell, { AdminEmpty } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  deleted_at: string | null;
}

type Tab = "all" | "unread" | "deleted";

async function api(method: "PATCH" | "DELETE", body: Record<string, unknown>): Promise<boolean> {
  const res = await fetch("/api/messages", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.ok;
}

function daysLeft(deletedAt: string, retentionDays: number): number {
  const expires = new Date(deletedAt).getTime() + retentionDays * 24 * 60 * 60 * 1000;
  return Math.max(0, Math.ceil((expires - Date.now()) / (24 * 60 * 60 * 1000)));
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [retentionDays, setRetentionDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("all");
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
        if (cancelled) return;
        setMessages(
          (data.messages ?? []).map((m: ContactMessage) => ({
            ...m,
            deleted_at: m.deleted_at ?? null,
          })),
        );
        if (typeof data.retentionDays === "number") setRetentionDays(data.retentionDays);
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

  function patchLocal(id: string, patch: Partial<ContactMessage>) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  async function markRead(m: ContactMessage, read: boolean) {
    patchLocal(m.id, { read });
    if (!(await api("PATCH", { id: m.id, read }))) patchLocal(m.id, { read: m.read });
  }

  async function moveToBin(m: ContactMessage) {
    patchLocal(m.id, { deleted_at: new Date().toISOString() });
    if (!(await api("PATCH", { id: m.id, deleted: true }))) {
      patchLocal(m.id, { deleted_at: null });
      setError("Couldn't delete that message. Please try again.");
    }
  }

  async function restore(m: ContactMessage) {
    patchLocal(m.id, { deleted_at: null });
    if (!(await api("PATCH", { id: m.id, deleted: false }))) {
      patchLocal(m.id, { deleted_at: m.deleted_at });
      setError("Couldn't restore that message. Please try again.");
    }
  }

  async function deleteForever(m: ContactMessage) {
    const snapshot = messages;
    setMessages((prev) => prev.filter((x) => x.id !== m.id));
    if (!(await api("DELETE", { id: m.id }))) {
      setMessages(snapshot);
      setError("Couldn't permanently delete that message. Please try again.");
    }
  }

  async function emptyBin() {
    const snapshot = messages;
    setMessages((prev) => prev.filter((x) => !x.deleted_at));
    if (!(await api("DELETE", { all: true }))) {
      setMessages(snapshot);
      setError("Couldn't empty the deleted messages. Please try again.");
    }
  }

  const active = messages.filter((m) => !m.deleted_at);
  const deleted = messages.filter((m) => m.deleted_at);
  const unread = active.filter((m) => !m.read).length;
  const visible =
    tab === "deleted" ? deleted : tab === "unread" ? active.filter((m) => !m.read) : active;

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: "all", label: "All", count: active.length },
    { key: "unread", label: "Unread", count: unread },
    { key: "deleted", label: "Deleted", count: deleted.length },
  ];

  return (
    <AdminShell
      title="Messages"
      description={loading ? "Loading…" : `${active.length} total · ${unread} unread`}
      actions={
        <div className="flex items-center rounded-md border border-border bg-background p-0.5">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "flex items-center gap-1.5 rounded px-3 py-1 text-xs font-medium transition-colors",
                tab === t.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              {t.count > 0 && (
                <span
                  className={cn(
                    "rounded-full px-1.5 text-[10px] tabular-nums",
                    tab === t.key ? "bg-primary-foreground/20" : "bg-muted",
                  )}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      }
    >
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {tab === "deleted" && deleted.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
          <span className="text-muted-foreground">
            Deleted messages are removed permanently after {retentionDays} days.
          </span>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" /> Empty deleted messages
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Permanently delete {deleted.length} message{deleted.length === 1 ? "" : "s"}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This removes every message in the Deleted tab for good. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={emptyBin}>Delete permanently</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {!loading && !error && visible.length === 0 && (
        <AdminEmpty>
          {tab === "unread"
            ? "You're all caught up."
            : tab === "deleted"
              ? "No deleted messages."
              : "No messages yet."}
        </AdminEmpty>
      )}

      <div className="space-y-3">
        {visible.map((m) => (
          <article
            key={m.id}
            className={cn(
              "rounded-xl border bg-card p-5 shadow-sm transition-colors",
              m.deleted_at
                ? "border-border opacity-80"
                : m.read
                  ? "border-border"
                  : "border-primary/40",
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {!m.read && !m.deleted_at && <span className="h-2 w-2 rounded-full bg-primary" />}
                  <p className="font-medium text-foreground">{m.name}</p>
                  {m.service && (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                      {m.service}
                    </span>
                  )}
                  {m.deleted_at && (
                    <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive">
                      Deletes in {daysLeft(m.deleted_at, retentionDays)} day
                      {daysLeft(m.deleted_at, retentionDays) === 1 ? "" : "s"}
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
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {new Date(m.created_at).toLocaleString()}
                </span>
                {m.deleted_at ? (
                  <>
                    <Button size="sm" variant="outline" onClick={() => restore(m)}>
                      <RotateCcw className="h-3.5 w-3.5" /> Restore
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete forever
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Permanently delete this message?</AlertDialogTitle>
                          <AlertDialogDescription>
                            The enquiry from {m.name} will be removed for good. This cannot be
                            undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteForever(m)}>
                            Delete permanently
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={`mailto:${m.email}?subject=${encodeURIComponent(
                          "Re: Your enquiry to Top Furniture Supplies",
                        )}`}
                      >
                        Reply
                      </a>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => markRead(m, !m.read)}>
                      {m.read ? "Mark unread" : "Mark read"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      title="Move to deleted"
                      aria-label="Move to deleted"
                      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => moveToBin(m)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
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

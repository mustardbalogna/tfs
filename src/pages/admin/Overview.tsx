import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BarChart3, Images, Mail, PenSquare } from "lucide-react";
import AdminShell, { AdminCard } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";

interface Snapshot {
  unread: number;
  totalMessages: number;
  categories: number;
  views30d: number | null;
  recent: { id: string; name: string; service: string; created_at: string; read: boolean }[];
}

type MessageRow = Snapshot["recent"][number] & { deleted_at?: string | null };

export default function AdminOverview() {
  const [data, setData] = useState<Snapshot | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
        const [msgRes, catRes, statsRes] = await Promise.all([
          fetch("/api/messages"),
          fetch("/api/categories"),
          fetch(`/api/stats?tz=${encodeURIComponent(tz)}`),
        ]);
        if (msgRes.status === 401) {
          navigate("/admin/login");
          return;
        }
        const all: MessageRow[] = msgRes.ok ? ((await msgRes.json()).messages ?? []) : [];
        const messages = all.filter((m) => !m.deleted_at);
        const categories = catRes.ok ? ((await catRes.json()).categories ?? []).length : 0;
        const views30d = statsRes.ok ? ((await statsRes.json()).totalViews as number) : null;
        if (cancelled) return;
        setData({
          unread: messages.filter((m) => !m.read).length,
          totalMessages: messages.length,
          categories,
          views30d,
          recent: messages.slice(0, 5),
        });
      } catch {
        if (!cancelled) setError("Some dashboard data could not be loaded.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <AdminShell title="Overview" description="A quick look at how the site is doing.">
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Unread messages" value={data ? data.unread : null} to="/admin/messages" />
        <Stat label="Categories" value={data ? data.categories : null} to="/admin/categories" />
        <Stat label="Page views (30 days)" value={data ? data.views30d : null} to="/admin/stats" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <AdminCard
          title="Edit your website"
          description="Change text, reorder sections and adjust layouts with a live preview."
          className="lg:col-span-3"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <QuickLink
              to="/admin/editor"
              icon={PenSquare}
              title="Site editor"
              desc="Edit pages exactly as visitors see them."
            />
            <QuickLink
              to="/admin/categories"
              icon={Images}
              title="Categories & photos"
              desc="Manage the gallery shown on the Categories page."
            />
            <QuickLink
              to="/admin/messages"
              icon={Mail}
              title="Messages"
              desc="Read and reply to contact form enquiries."
            />
            <QuickLink
              to="/admin/stats"
              icon={BarChart3}
              title="Statistics"
              desc="Traffic over the last 30 days."
            />
          </div>
        </AdminCard>

        <AdminCard
          title="Recent enquiries"
          className="lg:col-span-2"
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/messages">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          }
        >
          {!data && <p className="text-sm text-muted-foreground">Loading…</p>}
          {data && data.recent.length === 0 && (
            <p className="text-sm text-muted-foreground">No messages yet.</p>
          )}
          <ul className="divide-y divide-border">
            {data?.recent.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {!m.read && (
                      <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-primary" />
                    )}
                    {m.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {m.service || "General enquiry"}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {new Date(m.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </AdminCard>
      </div>
    </AdminShell>
  );
}

function Stat({ label, value, to }: { label: string; value: number | null; to: string }) {
  return (
    <Link
      to={to}
      className="rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40"
    >
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-serif text-3xl text-foreground">
        {value === null ? <span className="text-muted-foreground">—</span> : value}
      </p>
    </Link>
  );
}

function QuickLink({
  to,
  icon: Icon,
  title,
  desc,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      className="group flex gap-3 rounded-lg border border-border p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
      </div>
    </Link>
  );
}

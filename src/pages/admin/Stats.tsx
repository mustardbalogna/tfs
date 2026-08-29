import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";

interface StatsData {
  totalViews: number;
  uniqueVisitors: number;
  uniqueSessions: number;
  byHour: { hour: number; views: number }[];
  byDay: { date: string; views: number; sessions: number; visitors: number }[];
  topPages: { path: string; views: number }[];
  heatmap: { date: string; hours: number[] }[];
}

function formatPageLabel(path: string): string {
  if (path === "/") return "Home";
  return path
    .replace(/^\//, "")
    .split("/")
    .map((segment) =>
      segment
        .split("-")
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    )
    .join(" / ");
}

function DailyTrafficTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { payload: { views: number; sessions: number; visitors: number } }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const { views, sessions, visitors } = payload[0].payload;
  return (
    <div className="rounded-md border border-border bg-card p-3 text-xs shadow-sm">
      <p className="font-medium text-foreground">{label}</p>
      <p className="mt-1 text-muted-foreground">Page views: {views}</p>
      <p className="text-muted-foreground">Sessions: {sessions}</p>
      <p className="text-muted-foreground">Unique visitors: {visitors}</p>
    </div>
  );
}

export default function AdminStats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadStats() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stats");
      if (res.status === 401) {
        navigate("/admin/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to load stats");
      setStats(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-foreground">Website Statistics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Last 30 days</p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/admin">Back to Messages</Link>
        </Button>
      </div>

      {loading && <p className="mt-6 text-muted-foreground">Loading...</p>}
      {error && <p className="mt-6 text-destructive">{error}</p>}

      {stats && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">Total Page Views</p>
              <p className="mt-1 font-serif text-3xl text-foreground">{stats.totalViews}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">Sessions</p>
              <p className="mt-1 font-serif text-3xl text-foreground">{stats.uniqueSessions}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">Unique Visitors</p>
              <p className="mt-1 font-serif text-3xl text-foreground">{stats.uniqueVisitors}</p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-border bg-card p-6">
            <h2 className="font-serif text-lg text-foreground">Daily Traffic</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.byDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip content={<DailyTrafficTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-border bg-card p-6">
            <h2 className="font-serif text-lg text-foreground">Traffic by Hour of Day</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.byHour}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="views" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-border bg-card p-6">
            <h2 className="font-serif text-lg text-foreground">Traffic by Hour, per Day</h2>
            {stats.heatmap.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">No page views yet.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="border-collapse text-xs">
                  <thead>
                    <tr>
                      <th className="sticky left-0 bg-card pr-2 text-left font-normal text-muted-foreground">
                        Date
                      </th>
                      {Array.from({ length: 24 }, (_, hour) => (
                        <th key={hour} className="px-1 pb-1 font-normal text-muted-foreground">
                          {hour}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stats.heatmap.map((day) => {
                      const max = Math.max(1, ...day.hours);
                      return (
                        <tr key={day.date}>
                          <td className="sticky left-0 whitespace-nowrap bg-card pr-2 text-foreground">
                            {day.date}
                          </td>
                          {day.hours.map((views, hour) => (
                            <td key={hour} className="p-0.5">
                              <div
                                title={`${day.date} ${hour}:00 — ${views} view${views === 1 ? "" : "s"}`}
                                className="h-5 w-5 rounded-sm"
                                style={{
                                  backgroundColor:
                                    views === 0
                                      ? "var(--muted)"
                                      : `rgba(37, 99, 235, ${views / max})`,
                                }}
                              />
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-6 rounded-xl border border-border bg-card p-6">
            <h2 className="font-serif text-lg text-foreground">Top Pages</h2>
            {stats.topPages.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">No page views yet.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {stats.topPages.map((page) => (
                  <li key={page.path} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{formatPageLabel(page.path)}</span>
                    <span className="text-muted-foreground">{page.views}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

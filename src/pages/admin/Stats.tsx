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
  byHour: { hour: number; views: number }[];
  byDay: { date: string; views: number }[];
  topPages: { path: string; views: number }[];
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
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">Total Page Views</p>
              <p className="mt-1 font-serif text-3xl text-foreground">{stats.totalViews}</p>
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
                  <Tooltip />
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
            <h2 className="font-serif text-lg text-foreground">Top Pages</h2>
            {stats.topPages.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">No page views yet.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {stats.topPages.map((page) => (
                  <li key={page.path} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{page.path}</span>
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

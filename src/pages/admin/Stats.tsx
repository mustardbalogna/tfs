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

const CALENDAR_DAYS = 30;
const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function getLastNDates(n: number): string[] {
  const now = new Date();
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

function buildCalendarWeeks(dates: string[]): (string | null)[][] {
  if (dates.length === 0) return [];
  const firstWeekday = new Date(`${dates[0]}T00:00:00Z`).getUTCDay();
  const padded: (string | null)[] = [...Array(firstWeekday).fill(null), ...dates];
  while (padded.length % 7 !== 0) padded.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }
  return weeks;
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
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
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

  const heatmapByDate = new Map((stats?.heatmap ?? []).map((day) => [day.date, day.hours]));
  const viewsByDate = new Map((stats?.byDay ?? []).map((day) => [day.date, day.views]));
  const calendarDates = getLastNDates(CALENDAR_DAYS);
  const calendarWeeks = buildCalendarWeeks(calendarDates);
  const maxDailyViews = Math.max(1, ...Array.from(viewsByDate.values()));

  const selectedDayHours = selectedDay
    ? (heatmapByDate.get(selectedDay) ?? Array.from({ length: 24 }, () => 0))
    : undefined;
  const hourChartData =
    selectedDayHours?.map((views, hour) => ({ hour, views })) ?? stats?.byHour ?? [];

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
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg text-foreground">
                Traffic by Hour{selectedDay ? ` — ${selectedDay}` : " of Day"}
              </h2>
              {selectedDay && (
                <Button size="sm" variant="outline" onClick={() => setSelectedDay(null)}>
                  Clear
                </Button>
              )}
            </div>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourChartData}>
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
            <h2 className="font-serif text-lg text-foreground">Traffic Calendar</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Click a day to show its hourly breakdown above.
            </p>
            <div className="mt-4 flex gap-1">
              <div className="flex flex-col gap-1 pr-1 text-[10px] text-muted-foreground">
                {WEEKDAY_LABELS.map((label, i) => (
                  <div key={i} className="flex h-4 w-4 items-center justify-center leading-none">
                    {label}
                  </div>
                ))}
              </div>
              {calendarWeeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((date, dayIndex) => {
                    if (!date) return <div key={dayIndex} className="h-4 w-4" />;
                    const views = viewsByDate.get(date) ?? 0;
                    const isSelected = selectedDay === date;
                    return (
                      <button
                        key={date}
                        type="button"
                        title={`${date} — ${views} view${views === 1 ? "" : "s"}`}
                        onClick={() => setSelectedDay(isSelected ? null : date)}
                        className={`h-4 w-4 rounded-sm ${
                          isSelected ? "ring-2 ring-primary ring-offset-1 ring-offset-card" : ""
                        }`}
                        style={{
                          backgroundColor:
                            views === 0
                              ? "var(--muted)"
                              : `rgba(37, 99, 235, ${Math.max(0.15, views / maxDailyViews)})`,
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

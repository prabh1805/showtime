import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import FormError from "./FormError";
import { LoadingBlock } from "./Spinner";
import { getAnalytics } from "../api/analytics";
import { ApiError } from "../api/client";
import { useAuth } from "../context/useAuth";

const COLORS = {
  velvet: "#8C2D3F",
  marquee: "#B5790F",
  hairline: "#E4DCC8",
  mist: "#746C5C",
};

const RANGE_OPTIONS = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

/** "2026-09-13" -> "13 Sep" */
function formatDay(isoDate) {
  return new Date(isoDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

/**
 * Owner-only revenue/shows analytics for a theater: summary stat tiles plus
 * a revenue-over-time line chart and a shows-per-day bar chart, over a
 * selectable trailing window (7/30/90 days). Revenue counts only SUCCESS
 * bookings.
 *
 * @param {{ theaterId: number }} props
 */
export default function AnalyticsPanel({ theaterId }) {
  const { accessToken } = useAuth();
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await getAnalytics(theaterId, days, accessToken);
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError && err.body?.message
              ? err.body.message
              : "Couldn't load analytics.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [theaterId, days, accessToken]);

  const chartData = data?.dailyStats.map((d) => ({ ...d, day: formatDay(d.date) })) ?? [];

  return (
    <section className="w-full max-w-5xl rounded-lg border border-hairline bg-surface p-6 text-left shadow-sm sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold tracking-wide text-ink sm:text-2xl">
          Analytics
        </h2>
        <div className="flex gap-2">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.days}
              type="button"
              onClick={() => setDays(option.days)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                days === option.days
                  ? "border-velvet bg-velvet text-paper"
                  : "border-hairline text-ink hover:border-velvet hover:text-velvet"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-4">
          <FormError message={error} />
        </div>
      )}

      {loading ? (
        <LoadingBlock label="Loading analytics…" className="mt-6" />
      ) : data ? (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatTile label="Revenue" value={`₹${data.totalRevenue}`} />
            <StatTile label="Bookings" value={data.totalBookings} />
            <StatTile label="Shows" value={data.totalShows} />
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-medium text-mist">Revenue by day</h3>
            <div className="mt-2 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={COLORS.hairline} vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke={COLORS.mist}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis stroke={COLORS.mist} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip
                    formatter={(value) => [`₹${value}`, "Revenue"]}
                    contentStyle={{ borderColor: COLORS.hairline, borderRadius: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke={COLORS.velvet}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-medium text-mist">Shows per day</h3>
            <div className="mt-2 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={COLORS.hairline} vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke={COLORS.mist}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke={COLORS.mist}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                    allowDecimals={false}
                  />
                  <Tooltip
                    formatter={(value) => [value, "Shows"]}
                    contentStyle={{ borderColor: COLORS.hairline, borderRadius: 8 }}
                  />
                  <Bar dataKey="showsCount" fill={COLORS.marquee} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}

function StatTile({ label, value }) {
  return (
    <div className="rounded-md border border-hairline bg-paper p-4">
      <p className="text-xs uppercase tracking-wide text-mist">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}

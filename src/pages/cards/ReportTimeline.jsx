// src/pages/cards/ReportTimeline.jsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useReportStats } from "../../hooks/useReports";

export default function ReportTimeline({ className }) {
  const { stats, loading } = useReportStats();

  if (loading)
    return (
      <div
        className={`bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-4 ${className} flex items-center justify-center h-48`}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );

  const data = stats.last7Days; // [{ day: "Mon", count: 3 }, ...]

  if (!data || data.length === 0)
    return (
      <div
        className={`bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-4 ${className}`}
      >
        <h2 className="font-semibold text-gray-700 mb-4">Report Timeline</h2>
        <p className="text-gray-400 text-sm text-center py-8">No data yet.</p>
      </div>
    );

  return (
    <div
      className={`bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-4 ${className}`}
    >
      <h2 className="font-semibold text-gray-700 mb-4">
        Report Timeline — Last 7 Days
      </h2>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#6366F1"
            strokeWidth={2}
            dot={{ r: 4, fill: "#6366F1" }}
            activeDot={{ r: 6, fill: "#4F46E5" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// src/pages/cards/ReportsByPriority.jsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { useReportStats } from "../../hooks/useReports";

const PRIORITY_COLORS = {
  critical: "#DC2626",
  high: "#F97316",
  medium: "#EAB308",
  low: "#22C55E",
};

const PRIORITY_ORDER = ["critical", "high", "medium", "low"];

export default function ReportsByPriority({ className }) {
  const { stats, loading } = useReportStats();

  if (loading)
    return (
      <div className={`${className} flex items-center justify-center h-48`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );

  const data = PRIORITY_ORDER.filter((p) => stats.byPriority[p] > 0).map(
    (p) => ({
      name: p.charAt(0).toUpperCase() + p.slice(1),
      count: stats.byPriority[p] || 0,
      color: PRIORITY_COLORS[p],
    })
  );

  if (data.length === 0)
    return (
      <div className={className}>
        <h3 className="text-lg font-semibold mb-2 text-gray-700">
          Reports by Priority
        </h3>
        <p className="text-gray-400 text-sm text-center py-8">No data yet.</p>
      </div>
    );

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-2 text-gray-700">
        Reports by Priority
      </h3>
      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={data}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" radius={[5, 5, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

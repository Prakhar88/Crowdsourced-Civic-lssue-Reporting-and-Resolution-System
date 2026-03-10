// src/pages/cards/ReportsByCategory.jsx
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useReportStats } from "../../hooks/useReports";

const CATEGORY_COLORS = {
  pothole: "#EF4444",
  garbage: "#F59E0B",
  streetlight: "#3B82F6",
  flooding: "#6366F1",
  vandalism: "#EC4899",
};

export default function ReportsByCategory({ className }) {
  const { stats, loading } = useReportStats();

  if (loading)
    return (
      <div className={`${className} flex items-center justify-center h-48`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );

  const data = Object.entries(stats.byCategory).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  if (data.length === 0)
    return (
      <div className={className}>
        <h3 className="text-lg font-semibold mb-2 text-gray-700">
          Reports by Category
        </h3>
        <p className="text-gray-400 text-sm text-center py-8">No data yet.</p>
      </div>
    );

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-2 text-gray-700">
        Reports by Category
      </h3>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={60}
            fill="#8884d8"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={
                  CATEGORY_COLORS[entry.name.toLowerCase()] || "#94A3B8"
                }
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

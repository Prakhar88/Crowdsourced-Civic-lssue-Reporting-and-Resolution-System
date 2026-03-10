// src/pages/cards/DepartmentPerformance.jsx
import { useReports } from "../../hooks/useReports";

const CATEGORY_COLORS = {
  pothole: "#EF4444",
  garbage: "#F59E0B",
  streetlight: "#3B82F6",
  flooding: "#6366F1",
  vandalism: "#EC4899",
};

export default function DepartmentPerformance({ className }) {
  const { reports, loading } = useReports();

  if (loading)
    return (
      <div className={`${className} flex items-center justify-center h-48`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );

  // Calculate resolution rate per category
  const categoryMap = {};
  reports.forEach((r) => {
    const cat = r.category || "unknown";
    if (!categoryMap[cat]) categoryMap[cat] = { total: 0, resolved: 0 };
    categoryMap[cat].total += 1;
    if (r.status === "resolved") categoryMap[cat].resolved += 1;
  });

  const data = Object.entries(categoryMap).map(([category, { total, resolved }]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    key: category,
    rate: total > 0 ? Math.round((resolved / total) * 100) : 0,
    resolved,
    total,
  }));

  if (data.length === 0)
    return (
      <div className={className}>
        <h3 className="text-lg font-semibold mb-2 text-gray-700">
          Department Performance
        </h3>
        <p className="text-gray-400 text-sm text-center py-8">No data yet.</p>
      </div>
    );

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-4 text-gray-700">
        Department Performance
      </h3>
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.key}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">
                {item.category}
              </span>
              <span className="text-gray-500">
                {item.resolved}/{item.total} resolved ({item.rate}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${item.rate}%`,
                  backgroundColor:
                    CATEGORY_COLORS[item.key] || "#94A3B8",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

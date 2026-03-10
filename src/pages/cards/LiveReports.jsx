// src/pages/cards/LiveReports.jsx
import { useReports } from "../../hooks/useReports";

const statusColor = {
  pending: "bg-yellow-100 text-yellow-800",
  assigned: "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800",
  resolved: "bg-green-100 text-green-800",
};

export default function LiveReports({ className }) {
  const { reports, loading } = useReports();

  if (loading)
    return (
      <div className={`${className} flex items-center justify-center h-48`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );

  if (reports.length === 0)
    return (
      <div className={className}>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Live Reports
        </h2>
        <p className="text-gray-400 text-sm text-center py-8">
          No reports submitted yet.
        </p>
      </div>
    );

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Live Reports</h2>
        <span className="text-sm text-gray-500">{reports.length} total</span>
      </div>
      <div className="overflow-auto max-h-72 space-y-2">
        {reports.slice(0, 10).map((report) => (
          <div
            key={report.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {report.title}
              </p>
              <p className="text-xs text-gray-500">
                {report.location?.address || "Unknown location"}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-2">
              {report.aiConfidence != null && (
                <span className="text-xs text-gray-400">
                  AI: {Math.round(report.aiConfidence * 100)}%
                </span>
              )}
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  statusColor[report.status] || "bg-gray-100 text-gray-600"
                }`}
              >
                {report.status?.replace("_", " ") || "unknown"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
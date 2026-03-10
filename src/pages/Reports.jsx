// src/pages/Reports.jsx — Admin reports list with AI analysis + Auto-Assign
import { useState } from "react";
import { useReports, autoAssignReport } from "../hooks/useReports";
import {
  FaRobot,
  FaExclamationTriangle,
  FaCopy,
  FaUserPlus,
  FaSpinner,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

const PRIORITY_COLORS = {
  critical: "bg-red-100 text-red-800 border-red-300",
  high: "bg-orange-100 text-orange-800 border-orange-300",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  low: "bg-green-100 text-green-800 border-green-300",
};

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  assigned: "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800",
  resolved: "bg-green-100 text-green-800",
  duplicate: "bg-gray-200 text-gray-600",
};

const CATEGORY_ICONS = {
  pothole: "🕳️",
  garbage: "🗑️",
  streetlight: "💡",
  flooding: "🌊",
  vandalism: "🔨",
  other: "📌",
};

export default function Reports() {
  const { reports, loading } = useReports();
  const [assigning, setAssigning] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  const handleAutoAssign = async (report) => {
    setAssigning(report.id);
    try {
      await autoAssignReport(
        report.id,
        report.location?.lat,
        report.location?.lng
      );
    } catch (err) {
      console.error("Auto-assign failed:", err);
    } finally {
      setAssigning(null);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );

  // Apply filters
  let filtered = reports;
  if (filterStatus !== "all") {
    filtered = filtered.filter((r) => r.status === filterStatus);
  }
  if (filterCategory !== "all") {
    filtered = filtered.filter(
      (r) => (r.aiCategory || r.category) === filterCategory
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">All Reports</h1>
        <div className="flex gap-3 items-center text-sm">
          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="duplicate">Duplicate</option>
          </select>

          {/* Category filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Categories</option>
            <option value="pothole">Pothole</option>
            <option value="garbage">Garbage</option>
            <option value="streetlight">Streetlight</option>
            <option value="flooding">Flooding</option>
            <option value="vandalism">Vandalism</option>
            <option value="other">Other</option>
          </select>

          <span className="text-gray-400">{filtered.length} reports</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">
          No reports match the selected filters.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((report) => {
            const aiCat = report.aiCategory || report.category || "other";
            const aiPri = report.aiPriority || report.priority || "medium";
            const isExpanded = expanded === report.id;

            return (
              <div
                key={report.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition"
              >
                {/* ── Main row ── */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer"
                  onClick={() =>
                    setExpanded(isExpanded ? null : report.id)
                  }
                >
                  {/* Category icon */}
                  <span className="text-2xl">
                    {CATEGORY_ICONS[aiCat] || "📌"}
                  </span>

                  {/* Title + location */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {report.title || "Untitled"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {report.location?.address || "Unknown location"}
                    </p>
                  </div>

                  {/* AI category badge */}
                  <div className="flex items-center gap-1">
                    <FaRobot className="text-blue-400 text-xs" />
                    <span className="text-xs font-medium text-gray-600 capitalize">
                      {aiCat}
                    </span>
                    {report.aiConfidence != null && (
                      <span className="text-xs text-gray-400">
                        ({Math.round(report.aiConfidence * 100)}%)
                      </span>
                    )}
                  </div>

                  {/* AI priority badge */}
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium border ${
                      PRIORITY_COLORS[aiPri] || "bg-gray-100"
                    }`}
                  >
                    {aiPri}
                  </span>

                  {/* Status badge */}
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      STATUS_COLORS[report.status] || "bg-gray-100"
                    }`}
                  >
                    {report.status?.replace("_", " ") || "pending"}
                  </span>

                  {/* Duplicate warning */}
                  {report.duplicateOf && (
                    <span
                      className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200"
                      title={`Duplicate of ${report.duplicateOf}`}
                    >
                      <FaCopy /> Duplicate
                    </span>
                  )}

                  {/* AI status indicator */}
                  {report.aiStatus === "failed" && (
                    <span
                      className="flex items-center gap-1 text-xs text-red-500"
                      title="AI analysis failed"
                    >
                      <FaExclamationTriangle />
                    </span>
                  )}

                  {/* Expand icon */}
                  {isExpanded ? (
                    <FaChevronUp className="text-gray-400" />
                  ) : (
                    <FaChevronDown className="text-gray-400" />
                  )}
                </div>

                {/* ── Expanded details ── */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-50 pt-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Report details */}
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-700">
                            Description:{" "}
                          </span>
                          {report.description || "No description"}
                        </p>
                        {report.aiSummary && (
                          <p className="text-gray-600">
                            <span className="font-medium text-blue-600">
                              <FaRobot className="inline mr-1" />
                              AI Summary:{" "}
                            </span>
                            {report.aiSummary}
                          </p>
                        )}
                        {report.aiSuggestedAction && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-xs font-medium text-blue-700 mb-1">
                              💡 Suggested Action
                            </p>
                            <p className="text-sm text-blue-800">
                              {report.aiSuggestedAction}
                            </p>
                          </div>
                        )}
                        {report.duplicateOf && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <p className="text-xs font-medium text-amber-700 mb-1">
                              ⚠️ Duplicate Detected
                            </p>
                            <p className="text-sm text-amber-800">
                              This report is a duplicate of report{" "}
                              <code className="bg-amber-100 px-1 rounded">
                                {report.duplicateOf}
                              </code>
                              {report.duplicateDistance != null &&
                                ` (${report.duplicateDistance}m apart)`}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-col items-end justify-end gap-2">
                        {report.status === "pending" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAutoAssign(report);
                            }}
                            disabled={assigning === report.id}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition shadow disabled:opacity-50"
                          >
                            {assigning === report.id ? (
                              <FaSpinner className="animate-spin" />
                            ) : (
                              <FaUserPlus />
                            )}
                            Auto-Assign
                          </button>
                        )}
                        {report.imageURL && (
                          <a
                            href={report.imageURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View attached image →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

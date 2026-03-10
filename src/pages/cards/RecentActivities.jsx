// src/pages/cards/RecentActivities.jsx
import { useReports } from "../../hooks/useReports";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaClock,
  FaUserCheck,
} from "react-icons/fa";

const STATUS_META = {
  pending: {
    icon: <FaExclamationCircle className="text-yellow-500" />,
    label: "submitted",
  },
  assigned: {
    icon: <FaUserCheck className="text-blue-500" />,
    label: "assigned to staff",
  },
  in_progress: {
    icon: <FaClock className="text-purple-500" />,
    label: "work in progress",
  },
  resolved: {
    icon: <FaCheckCircle className="text-green-500" />,
    label: "resolved",
  },
};

function timeAgo(firebaseTimestamp) {
  if (!firebaseTimestamp?.toDate) return "";
  const diff = Date.now() - firebaseTimestamp.toDate().getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function RecentActivities({ className }) {
  const { reports, loading } = useReports();

  if (loading)
    return (
      <div
        className={`bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-4 ${className} flex items-center justify-center h-32`}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );

  const recent = reports.slice(0, 5);

  if (recent.length === 0)
    return (
      <div
        className={`bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-4 ${className}`}
      >
        <h2 className="font-semibold text-gray-700 mb-3">Recent Activities</h2>
        <p className="text-gray-400 text-sm text-center py-4">
          No activity yet.
        </p>
      </div>
    );

  return (
    <div
      className={`bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-4 ${className}`}
    >
      <h2 className="font-semibold text-gray-700 mb-3">Recent Activities</h2>
      <ul className="space-y-2 text-sm">
        {recent.map((report) => {
          const meta = STATUS_META[report.status] || STATUS_META.pending;
          return (
            <li
              key={report.id}
              className="flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                {meta.icon}
                <span className="text-gray-700 truncate">
                  <span className="font-medium">{report.title}</span>{" "}
                  <span className="text-gray-500">— {meta.label}</span>
                </span>
              </div>
              <span className="text-gray-400 text-xs whitespace-nowrap">
                {timeAgo(report.updatedAt || report.createdAt)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

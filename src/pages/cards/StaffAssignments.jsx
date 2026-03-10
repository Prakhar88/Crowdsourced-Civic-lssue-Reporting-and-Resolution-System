// src/pages/cards/StaffAssignments.jsx
import { useWorkers } from "../../hooks/useWorkers";

export default function StaffAssignments({ className }) {
  const { workers, loading } = useWorkers();

  if (loading)
    return (
      <div className={`${className} flex items-center justify-center h-48`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );

  if (workers.length === 0)
    return (
      <div className={className}>
        <h3 className="text-lg font-semibold mb-2 text-gray-700">
          Staff Assignments
        </h3>
        <p className="text-gray-400 text-sm text-center py-8">
          No workers registered yet.
        </p>
      </div>
    );

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-2 text-gray-700">
        Staff Assignments
      </h3>
      <div className="overflow-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-2">Name</th>
              <th className="py-2 px-2">Zone</th>
              <th className="py-2 px-2">Tasks</th>
              <th className="py-2 px-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {workers.map((worker) => (
              <tr
                key={worker.id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="py-2 px-2 font-medium">{worker.name}</td>
                <td className="py-2 px-2 text-gray-600">
                  {worker.zone || "—"}
                </td>
                <td className="py-2 px-2 text-gray-600">
                  {worker.assignedTasks?.length || 0}
                </td>
                <td className="py-2 px-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      worker.isAvailable
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {worker.isAvailable ? "Available" : "Busy"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

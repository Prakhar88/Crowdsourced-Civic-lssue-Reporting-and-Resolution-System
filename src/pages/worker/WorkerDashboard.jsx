// src/pages/worker/WorkerDashboard.jsx
import { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  useWorkerTasks,
  updateTaskStatus,
} from "../../hooks/useWorkerTasks";
import { uploadImage } from "../../utils/uploadImage";
import {
  FaClipboardCheck,
  FaSpinner,
  FaPlay,
  FaCheckCircle,
  FaCamera,
  FaExclamationTriangle,
} from "react-icons/fa";

const CATEGORY_ICONS = {
  pothole: "🕳️",
  garbage: "🗑️",
  streetlight: "💡",
  flooding: "🌊",
  vandalism: "🔨",
};

const PRIORITY_COLORS = {
  critical: "bg-red-100 text-red-800",
  high: "bg-orange-100 text-orange-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
};

const STATUS_COLORS = {
  assigned: "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800",
  done: "bg-green-100 text-green-800",
};

export default function WorkerDashboard() {
  const { user } = useAuth();
  const { tasks, loading } = useWorkerTasks(user?.uid);
  const [actionLoading, setActionLoading] = useState(null);
  const [uploadModal, setUploadModal] = useState(null); // taskId being completed
  const fileInputRef = useRef(null);

  const totalAssigned = tasks.length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const completedToday = tasks.filter((t) => {
    if (t.status !== "done" || !t.updatedAt?.toDate) return false;
    return t.updatedAt.toDate().toDateString() === new Date().toDateString();
  }).length;

  const handleStartTask = async (taskId) => {
    setActionLoading(taskId);
    try {
      await updateTaskStatus(taskId, "in_progress");
    } catch (err) {
      console.error("Failed to start task:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteTask = (taskId) => {
    setUploadModal(taskId);
  };

  const handleUploadAndComplete = async (taskId, file) => {
    setActionLoading(taskId);
    setUploadModal(null);
    try {
      let afterURL = null;
      if (file) {
        afterURL = await uploadImage(file, "task-completions");
      }
      await updateTaskStatus(taskId, "done", afterURL);
    } catch (err) {
      console.error("Failed to complete task:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSkipPhoto = () => {
    if (uploadModal) {
      handleUploadAndComplete(uploadModal, null);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && uploadModal) {
      handleUploadAndComplete(uploadModal, file);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500" />
      </div>
    );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">My Tasks</h1>

      {/* ─── Stats row ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md p-5 flex items-center space-x-4">
          <FaClipboardCheck className="text-3xl text-blue-500" />
          <div>
            <p className="text-gray-500 text-sm">Total Assigned</p>
            <p className="text-2xl font-bold">{totalAssigned}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5 flex items-center space-x-4">
          <FaSpinner className="text-3xl text-purple-500" />
          <div>
            <p className="text-gray-500 text-sm">In Progress</p>
            <p className="text-2xl font-bold">{inProgress}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5 flex items-center space-x-4">
          <FaCheckCircle className="text-3xl text-green-500" />
          <div>
            <p className="text-gray-500 text-sm">Completed Today</p>
            <p className="text-2xl font-bold">{completedToday}</p>
          </div>
        </div>
      </div>

      {/* ─── Task list ─── */}
      {tasks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <FaClipboardCheck className="text-5xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No tasks assigned to you yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => {
            const report = task.report;
            const cat = report?.category || "unknown";
            const priority = report?.aiPriority || report?.priority || "medium";

            return (
              <div
                key={task.id}
                className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition flex flex-col"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-2xl">
                      {CATEGORY_ICONS[cat] || "📌"}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 truncate">
                        {report?.title || "Untitled Task"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {report?.location?.address || "Unknown location"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${
                      PRIORITY_COLORS[priority] || "bg-gray-100"
                    }`}
                  >
                    {priority}
                  </span>
                </div>

                {/* Status */}
                <div className="mb-4">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      STATUS_COLORS[task.status] || "bg-gray-100"
                    }`}
                  >
                    {task.status?.replace("_", " ") || "assigned"}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="mt-auto flex gap-2">
                  {task.status === "assigned" && (
                    <button
                      onClick={() => handleStartTask(task.id)}
                      disabled={actionLoading === task.id}
                      className="flex items-center gap-1 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                    >
                      {actionLoading === task.id ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaPlay className="text-xs" />
                      )}
                      Start Task
                    </button>
                  )}
                  {task.status === "in_progress" && (
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      disabled={actionLoading === task.id}
                      className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                    >
                      {actionLoading === task.id ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaCheckCircle />
                      )}
                      Mark Complete
                    </button>
                  )}
                  {task.status === "done" && (
                    <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                      <FaCheckCircle /> Completed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Upload modal ─── */}
      {uploadModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-96 max-w-[90%]">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Upload "After" Photo
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Take a photo showing the issue has been resolved.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="flex flex-col gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 w-full py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-medium"
              >
                <FaCamera /> Choose / Take Photo
              </button>
              <button
                onClick={handleSkipPhoto}
                className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm transition"
              >
                Skip — complete without photo
              </button>
              <button
                onClick={() => setUploadModal(null)}
                className="w-full py-2 text-gray-400 hover:text-gray-600 text-sm transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

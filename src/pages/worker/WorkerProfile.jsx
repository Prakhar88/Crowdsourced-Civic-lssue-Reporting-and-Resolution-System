// src/pages/worker/WorkerProfile.jsx
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import {
  FaUserCircle,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";

export default function WorkerProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      const snap = await getDoc(doc(db, "workers", user.uid));
      if (snap.exists()) {
        setProfile({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    })();
  }, [user?.uid]);

  const toggleAvailability = async () => {
    if (!profile) return;
    setToggling(true);
    try {
      const newVal = !profile.isAvailable;
      await updateDoc(doc(db, "workers", profile.id), {
        isAvailable: newVal,
      });
      setProfile((p) => ({ ...p, isAvailable: newVal }));
    } catch (err) {
      console.error("Failed to toggle availability:", err);
    } finally {
      setToggling(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500" />
      </div>
    );

  if (!profile)
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Worker profile not found.</p>
      </div>
    );

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">My Profile</h1>

      <div className="bg-white rounded-xl shadow-md p-6">
        {/* Avatar area */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="avatar"
              className="w-16 h-16 rounded-full border-2 border-amber-400"
            />
          ) : (
            <FaUserCircle className="text-6xl text-gray-300" />
          )}
          <div>
            <p className="text-xl font-semibold text-gray-800">
              {profile.name || user?.displayName || "Worker"}
            </p>
            <p className="text-sm text-gray-500">Field Worker</p>
          </div>
        </div>

        {/* Info rows */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <FaEnvelope className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="text-gray-700">{profile.email || user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FaMapMarkerAlt className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Zone</p>
              <p className="text-gray-700">{profile.zone || "Not assigned"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FaCheckCircle className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Completed Tasks</p>
              <p className="text-gray-700 font-semibold">
                {profile.completedTasks?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Availability toggle */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Availability</p>
              <p className="text-xs text-gray-500">
                {profile.isAvailable
                  ? "You are visible for new task assignments"
                  : "You won't receive new task assignments"}
              </p>
            </div>
            <button
              onClick={toggleAvailability}
              disabled={toggling}
              className="text-4xl transition disabled:opacity-50"
              aria-label="Toggle availability"
            >
              {profile.isAvailable ? (
                <FaToggleOn className="text-green-500 hover:text-green-600" />
              ) : (
                <FaToggleOff className="text-gray-400 hover:text-gray-500" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

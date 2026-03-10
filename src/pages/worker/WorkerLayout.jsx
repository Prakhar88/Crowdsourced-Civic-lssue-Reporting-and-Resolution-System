// src/pages/worker/WorkerLayout.jsx
import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaClipboardList,
  FaMapMarkerAlt,
  FaUserCircle,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import CivicLogo from "../../components/CivicLogo";

const NAV_LINKS = [
  { to: "/worker/dashboard", label: "My Tasks", icon: <FaClipboardList /> },
  { to: "/worker/map", label: "Map View", icon: <FaMapMarkerAlt /> },
  { to: "/worker/profile", label: "Profile", icon: <FaUserCircle /> },
];

export default function WorkerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate("/worker/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-900 to-gray-900 shadow-lg">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen((p) => !p)}
                className="text-white hover:text-amber-400 transition p-2 rounded hover:bg-white/10"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? (
                  <FaBars className="w-5 h-5" />
                ) : (
                  <FaBars className="w-5 h-5" />
                )}
              </button>
              <Link
                to="/worker/dashboard"
                className="flex items-center space-x-2 hover:opacity-80 transition"
              >
                <CivicLogo />
                <span className="text-amber-400 font-semibold text-sm hidden sm:inline">
                  Worker Portal
                </span>
              </Link>
            </div>

            {/* Right */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 text-sm hidden sm:block">
                {user?.displayName || user?.email}
              </span>
              {user?.photoURL && (
                <img
                  src={user.photoURL}
                  alt="avatar"
                  className="w-8 h-8 rounded-full border-2 border-amber-400"
                />
              )}
              <button
                onClick={handleLogout}
                className="text-white hover:text-red-400 transition p-2 rounded hover:bg-white/10"
                aria-label="Logout"
              >
                <FaSignOutAlt className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Sidebar ─── */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-gradient-to-b from-slate-900 to-gray-900 border-r border-gray-800 flex flex-col overflow-y-auto transition-transform duration-300 z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mt-2 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center space-x-3 px-4 py-3 mx-2 rounded-lg transition-all ${
                location.pathname === link.to
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/50"
                  : "text-gray-300 hover:bg-white/5"
              }`}
            >
              <span className="text-lg">{link.icon}</span>
              <span className="font-medium">{link.label}</span>
            </Link>
          ))}
        </div>

        <div className="flex-1" />
        <div className="p-4 border-t border-gray-800">
          <p className="text-xs text-gray-500 text-center">
            © 2025 CivicSense
          </p>
        </div>
      </aside>

      {/* ─── Main content ─── */}
      <div
        className={`pt-20 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        } p-6`}
      >
        <Outlet />
      </div>
    </div>
  );
}

import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";
import { ROLES } from "../../lib/constants";

export default function SSOCallback() {
  const { user, role, loading } = useAuth();

  // Wait for auth context to load
  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm text-slate-500">Completing sign in…</p>
        </div>
        <AuthenticateWithRedirectCallback />
      </div>
    );
  }

  // Once user + role loaded, redirect to correct portal
  const map = {
    [ROLES.ADMIN]: "/admin/dashboard",
    [ROLES.WORKER]: "/worker/dashboard",
    [ROLES.HELPER]: "/helper/home",
  };
  return <Navigate to={map[role] || "/helper/home"} replace />;
}


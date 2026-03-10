// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";

// Worker portal
import WorkerLogin from "./pages/worker/WorkerLogin";
import WorkerLayout from "./pages/worker/WorkerLayout";
import WorkerDashboard from "./pages/worker/WorkerDashboard";
import WorkerMapView from "./pages/worker/WorkerMapView";
import WorkerProfile from "./pages/worker/WorkerProfile";

function ProtectedRoute({ children, requiredRole }) {
  const { user, role, authLoading } = useAuth();

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/worker/login" element={<WorkerLogin />} />

          {/* Admin routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole="admin"><Dashboard /></ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute requiredRole="admin"><Reports /></ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute requiredRole="admin"><Analytics /></ProtectedRoute>
          } />

          {/* Worker routes — nested under WorkerLayout */}
          <Route path="/worker" element={
            <ProtectedRoute requiredRole="worker"><WorkerLayout /></ProtectedRoute>
          }>
            <Route path="dashboard" element={<WorkerDashboard />} />
            <Route path="map" element={<WorkerMapView />} />
            <Route path="profile" element={<WorkerProfile />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
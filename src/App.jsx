import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from "./services/firebaseConfig";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";

const auth = getAuth(app);

// ✅ Protects routes from unauthenticated access
function ProtectedRoute({ children }) {
    const [user, setUser] = useState(undefined); // undefined = still checking

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser ?? null);
        });
        return () => unsubscribe();
    }, []);

    // Still checking auth state — render nothing (or a spinner)
    if (user === undefined) return null;

    // Not logged in — redirect to login
    if (!user) return <Navigate to="/login" replace />;

    return children;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* ✅ FIX #1: Root redirect */}
                

                {/* Public routes */}
                <Route path="/login" element={<Login />} />

                

                {/* ✅ FIX #3: Protected routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />

                {/* ✅ FIX #2: Catch-all 404 redirect */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
// src/pages/worker/WorkerLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Shield } from "lucide-react";
import { FaHardHat } from "react-icons/fa";

export default function WorkerLogin() {
  const [email, setEmail] = useState("test1@a.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { loginWithEmail } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await loginWithEmail(email, password);
      navigate("/worker/dashboard");
    } catch (err) {
      const messages = {
        "auth/invalid-email": "Invalid email address",
        "auth/user-not-found": "No account found with this email",
        "auth/wrong-password": "Incorrect password",
        "auth/invalid-credential": "Invalid email or password",
      };
      setError(messages[err.code] || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-800 to-slate-900 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute pointer-events-none -top-40 -left-40 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl" />
      <div className="absolute pointer-events-none -bottom-40 -right-40 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />

      {/* Decorative icons */}
      <FaHardHat
        aria-hidden="true"
        className="absolute text-white/10 text-9xl top-20 left-16 rotate-12"
      />
      <FaHardHat
        aria-hidden="true"
        className="absolute text-white/10 text-8xl bottom-24 right-20 -rotate-12"
      />

      {/* Login card */}
      <div className="relative z-10 bg-white/10 backdrop-blur-lg shadow-2xl rounded-xl p-10 w-96 border border-white/20">
        <div className="flex flex-col items-center mb-6">
          <Shield size={42} className="text-amber-400 mb-3" />
          <h2 className="text-2xl font-bold text-white">Worker Portal</h2>
          <p className="text-gray-300 text-sm">Sign in with your credentials</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="w-full px-4 py-3 rounded-lg bg-gray-900/40 border border-gray-700 placeholder-gray-400 text-white focus:ring-2 focus:ring-amber-500 outline-none disabled:opacity-50"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="w-full px-4 py-3 rounded-lg bg-gray-900/40 border border-gray-700 placeholder-gray-400 text-white focus:ring-2 focus:ring-amber-500 outline-none disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-lg hover:opacity-90 transition duration-300 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-gray-400 text-xs text-center mt-6">
          © 2025 CivicSense — Worker Portal
        </p>
      </div>
    </div>
  );
}

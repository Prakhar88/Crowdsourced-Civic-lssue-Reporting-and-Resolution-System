import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import app from "../services/firebaseConfig";
import { Shield } from "lucide-react";
import { FaGoogle, FaTrash, FaTools, FaTrafficLight, FaUsers, FaShareAlt, FaThumbsUp } from "react-icons/fa";
import { MdEco, MdOutlineReportProblem, MdOutlineFeedback, MdOutlineWaterDrop, MdGroups, MdPark } from "react-icons/md";
import { AiOutlineTeam, AiOutlineForm } from "react-icons/ai";
import { RiSurveyLine } from "react-icons/ri";

// ✅ FIX #1: Initialize outside component to prevent re-instantiation on every render
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [resetSent, setResetSent] = useState(false);
    const navigate = useNavigate();

    const getRoleAndRedirect = async (uid) => {
        try {
            const adminSnap = await getDoc(doc(db, "admins", uid));
            if (adminSnap.exists()) { navigate("/dashboard"); return; }

            const workerSnap = await getDoc(doc(db, "workers", uid));
            if (workerSnap.exists()) { navigate("/worker/dashboard"); return; }

            navigate("/citizen"); // default → citizen portal
        } catch (err) {
            console.error("Role check failed:", err);
            navigate("/citizen"); // safe fallback
        }
    };

    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    // Email/Password login
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setResetSent(false);

        if (!email || !password) {
            setError("Please enter both email and password");
            return;
        }
        if (!isValidEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            // ✅ FIX #2: Added role field for email/password login (was missing before)
            // ✅ FIX #3: Use serverTimestamp() instead of new Date() for consistency
            await setDoc(doc(db, "users", userCredential.user.uid), {
                email: userCredential.user.email,
                role: "user",
                lastLogin: serverTimestamp()
            }, { merge: true });

            // ✅ Role-based redirect
            await getRoleAndRedirect(userCredential.user.uid);
        } catch (error) {
            const errorMessages = {
                "auth/invalid-email": "Invalid email address",
                "auth/user-disabled": "This account has been disabled",
                "auth/user-not-found": "No account found. Please sign up first",
                "auth/wrong-password": "Incorrect password",
                "auth/invalid-credential": "Invalid email or password"
            };
            setError(errorMessages[error.code] || error.message || "Login failed. Please try again");
        } finally {
            setLoading(false);
        }
    };

    // Google login
    const handleGoogleLogin = async () => {
        setError("");
        setResetSent(false);
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Save user to Firestore (fire and forget)
            setDoc(doc(db, "users", user.uid), {
                name: user.displayName,
                email: user.email,
                photoURL: user.photoURL || "",
                lastLogin: serverTimestamp()
            }, { merge: true }).catch(() => {});

            // ✅ Role-based redirect
            await getRoleAndRedirect(user.uid);
        } catch (error) {
            console.error("❌ Google login error:", error.code, error.message);
            if (error.code === "auth/popup-closed-by-user") {
                setError("Sign in cancelled");
            } else if (error.code === "auth/operation-not-supported-in-this-environment") {
                setError("Google sign-in not available. Check CORS and domain settings.");
            } else {
                setError(error.message || "Google sign in failed");
            }
            setLoading(false);
        }
    };

    // ✅ FIX #5: Added forgot password handler
    const handleForgotPassword = async () => {
        setError("");
        setResetSent(false);

        if (!email) {
            setError("Please enter your email address first");
            return;
        }
        if (!isValidEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }

        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setResetSent(true);
        } catch (error) {
            const errorMessages = {
                "auth/user-not-found": "No account found with this email",
                "auth/invalid-email": "Invalid email address"
            };
            setError(errorMessages[error.code] || "Failed to send reset email. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-800 to-slate-900 relative overflow-hidden">
            {/* ✅ FIX #6: Added aria-hidden="true" to all decorative background icons */}
            <FaTrash aria-hidden="true" className="absolute text-white/10 text-8xl top-20 left-16 rotate-12 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] transition duration-300 hover:text-white hover:drop-shadow-[0_0_20px_rgba(52,211,153,0.8)] hover:scale-110" />
            <FaTools aria-hidden="true" className="absolute text-white/10 text-8xl bottom-24 right-20 -rotate-6 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] transition duration-300 hover:text-white hover:drop-shadow-[0_0_20px_rgba(52,211,153,0.8)] hover:scale-110" />
            <FaTrafficLight aria-hidden="true" className="absolute text-white/10 text-7xl bottom-10 left-1/3 rotate-3 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] transition duration-300 hover:text-white hover:drop-shadow-[0_0_20px_rgba(52,211,153,0.8)] hover:scale-110" />
            <FaUsers aria-hidden="true" className="absolute text-white/10 text-7xl top-32 right-10 -rotate-12 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] transition duration-300 hover:text-white hover:drop-shadow-[0_0_20px_rgba(52,211,153,0.8)] hover:scale-110" />
            <FaShareAlt aria-hidden="true" className="absolute text-white/10 text-9xl bottom-36 left-8 rotate-6 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] transition duration-300 hover:text-white hover:drop-shadow-[0_0_20px_rgba(52,211,153,0.8)] hover:scale-110" />
            <FaThumbsUp aria-hidden="true" className="absolute text-white/10 text-9xl top-40 left-1/4 -rotate-3 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] transition duration-300 hover:text-white hover:drop-shadow-[0_0_20px_rgba(52,211,153,0.8)] hover:scale-110" />
            <MdEco aria-hidden="true" className="absolute text-white/10 text-9xl top-10 right-1/4 rotate-6 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] transition duration-300 hover:text-white hover:drop-shadow-[0_0_20px_rgba(52,211,153,0.8)] hover:scale-110" />
            <MdOutlineReportProblem aria-hidden="true" className="absolute text-white/10 text-9xl bottom-16 left-20 -rotate-9 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] transition duration-300 hover:text-white hover:drop-shadow-[0_0_20px_rgba(52,211,153,0.8)] hover:scale-110" />
            <MdOutlineFeedback aria-hidden="true" className="absolute text-white/10 text-6xl top-1/3 left-1/2 rotate-12 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] transition duration-300 hover:text-white hover:drop-shadow-[0_0_20px_rgba(52,211,153,0.8)] hover:scale-110" />
            <MdOutlineWaterDrop aria-hidden="true" className="absolute text-white/10 text-7xl bottom-32 right-1/3 rotate-3 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] transition duration-300 hover:text-white hover:drop-shadow-[0_0_20px_rgba(52,211,153,0.8)] hover:scale-110" />
            <MdGroups aria-hidden="true" className="absolute text-white/10 text-6xl top-1/4 left-10 -rotate-6 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] transition duration-300 hover:text-white hover:drop-shadow-[0_0_20px_rgba(52,211,153,0.8)] hover:scale-110" />
            <MdPark aria-hidden="true" className="absolute text-white/10 text-7xl bottom-20 right-1/4 rotate-9 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] transition duration-300 hover:text-white hover:drop-shadow-[0_0_20px_rgba(52,211,153,0.8)] hover:scale-110" />
            <AiOutlineTeam aria-hidden="true" className="absolute text-white/10 text-8xl top-16 left-3/4 -rotate-12 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] transition duration-300 hover:text-white hover:drop-shadow-[0_0_20px_rgba(52,211,153,0.8)] hover:scale-110" />
            <AiOutlineForm aria-hidden="true" className="absolute text-white/10 text-9xl bottom-80 right-16 rotate-6 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] transition duration-300 hover:text-white hover:drop-shadow-[0_0_20px_rgba(52,211,153,0.8)] hover:scale-110" />
            <RiSurveyLine aria-hidden="true" className="absolute text-white/10 text-9xl top-1/2 left-1/3 -rotate-3 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] transition duration-300 hover:text-white hover:drop-shadow-[0_0_20px_rgba(52,211,153,0.8)] hover:scale-110" />

            {/* Background Glow */}
            <div className="absolute pointer-events-none -top-40 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl"></div>
            <div className="absolute pointer-events-none -bottom-40 -right-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>

            {/* Glass Login Card */}
            <div className="relative z-10 bg-white/10 backdrop-blur-lg shadow-2xl rounded-xl p-10 w-96 border border-white/20">
                <div className="flex flex-col items-center mb-6">
                    <Shield size={42} className="text-emerald-400 mb-3" />
                    <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                    <p className="text-gray-300 text-sm">Sign in to your account</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
                        <p className="text-red-300 text-sm">{error}</p>
                    </div>
                )}

                {/* ✅ FIX #5: Password reset success message */}
                {resetSent && (
                    <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-lg p-3 mb-4">
                        <p className="text-emerald-300 text-sm">Password reset email sent! Check your inbox.</p>
                    </div>
                )}

                {/* Email/Password Form */}
                <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        className="w-full px-4 py-3 rounded-lg bg-gray-900/40 border border-gray-700 placeholder-gray-400 text-white focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-50"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="w-full px-4 py-3 rounded-lg bg-gray-900/40 border border-gray-700 placeholder-gray-400 text-white focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-50"
                    />

                    {/* ✅ FIX #5: Forgot password link */}
                    <div className="flex justify-end -mt-2">
                        <button
                            type="button"
                            onClick={handleForgotPassword}
                            disabled={loading}
                            className="text-emerald-400 text-xs hover:underline disabled:opacity-50"
                        >
                            Forgot password?
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold shadow-lg hover:opacity-90 transition duration-300 disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                {/* OR Separator */}
                <div className="flex items-center my-4">
                    <hr className="flex-1 border-gray-500/50" />
                    <span className="mx-2 text-gray-400 text-sm">OR</span>
                    <hr className="flex-1 border-gray-500/50" />
                </div>

                {/* Google Login Button */}
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full py-3 flex items-center justify-center gap-2 rounded-lg bg-white text-gray-900 font-semibold shadow hover:bg-gray-100 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FaGoogle /> {loading ? "Please wait..." : "Sign in with Google"}
                </button>

                <p className="text-gray-400 text-xs text-center mt-4">
                    Admin? Use Google Sign In · Workers use email/password
                </p>

                <p className="text-gray-400 text-xs text-center mt-4">
                    © 2025 City Civic Portal
                </p>
            </div>
        </div>
    );
}
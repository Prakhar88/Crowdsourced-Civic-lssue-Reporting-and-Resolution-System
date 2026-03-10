// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../services/firebaseConfig";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading
  const [role, setRole] = useState(null); // "admin" | "worker" | "user" | null
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Determine role with a 5-second timeout safety
        const rolePromise = (async () => {
          try {
            const adminDoc = await getDoc(doc(db, "admins", firebaseUser.uid));
            if (adminDoc.exists()) return "admin";

            const workerDoc = await getDoc(doc(db, "workers", firebaseUser.uid));
            if (workerDoc.exists()) return "worker";

            return "user";
          } catch (err) {
            console.error("Role detection failed:", err);
            return "user";
          }
        })();

        const timeoutPromise = new Promise((resolve) =>
          setTimeout(() => resolve("user"), 5000)
        );

        const detectedRole = await Promise.race([rolePromise, timeoutPromise]);
        setRole(detectedRole);
        setUser(firebaseUser);
      } else {
        setUser(null);
        setRole(null);
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // Google login — used by admins
  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const u = result.user;
    // Create admin doc on first login (control who's admin via Firestore Console)
    const adminRef = doc(db, "admins", u.uid);
    const adminSnap = await getDoc(adminRef);
    if (!adminSnap.exists()) {
      await setDoc(adminRef, {
        name: u.displayName,
        email: u.email,
        photoURL: u.photoURL,
        role: "admin",
        createdAt: serverTimestamp(),
      });
    }
    return result;
  };

  // Email/password login — used by workers
  const loginWithEmail = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result;
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider
      value={{ user, role, authLoading, loginWithGoogle, loginWithEmail, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
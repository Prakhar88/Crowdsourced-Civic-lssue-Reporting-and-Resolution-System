// src/services/firebaseConfig.js
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyAkBklMejDxbhegb0c9Pg5OsDSjrXVNvjY",
  authDomain: "civic-sense-c91e3.firebaseapp.com",
  projectId: "civic-sense-c91e3",
  storageBucket: "civic-sense-c91e3.firebasestorage.app",
  messagingSenderId: "621449590665",
  appId: "1:621449590665:web:58fa9827acebde5bb79358",
  measurementId: "G-XD0W32FRQ8"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
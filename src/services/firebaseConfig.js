import { initializeApp, getApp, getApps } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAkBklMejDxbhegb0c9Pg5OsDSjrXVNvjY",
  authDomain: "civic-sense-c91e3.firebaseapp.com",
  projectId: "civic-sense-c91e3",
  storageBucket: "civic-sense-c91e3.firebasestorage.app",
  messagingSenderId: "621449590665",
  appId: "1:621449590665:web:58fa9827acebde5bb79358",
  measurementId: "G-XD0W32FRQ8"
};

// Initialize Firebase - check if app already exists to prevent duplicate initialization
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}
export default app;



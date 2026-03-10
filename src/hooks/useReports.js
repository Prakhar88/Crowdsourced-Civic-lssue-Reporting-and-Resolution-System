// src/hooks/useReports.js
import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../services/firebaseConfig";

// ---------------------------------------------------------------------------
// Real-time listener for all reports
// ---------------------------------------------------------------------------
export function useReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setReports(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { reports, loading };
}

// ---------------------------------------------------------------------------
// Derived stats for dashboard cards
// ---------------------------------------------------------------------------
export function useReportStats() {
  const { reports, loading } = useReports();

  const stats = {
    total: reports.length,
    pending: reports.filter((r) => r.status === "pending").length,
    inProgress: reports.filter((r) => r.status === "in_progress").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    byCategory: reports.reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + 1;
      return acc;
    }, {}),
    byPriority: reports.reduce((acc, r) => {
      const p = r.aiPriority || r.priority || "medium";
      acc[p] = (acc[p] || 0) + 1;
      return acc;
    }, {}),
    last7Days: getLast7DaysCounts(reports),
    recent: reports.slice(0, 5),
  };

  return { stats, loading };
}

function getLast7DaysCounts(reports) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-US", { weekday: "short" });
    const count = reports.filter((r) => {
      if (!r.createdAt?.toDate) return false;
      const rd = r.createdAt.toDate();
      return rd.toDateString() === d.toDateString();
    }).length;
    days.push({ day: label, count });
  }
  return days;
}

// ---------------------------------------------------------------------------
// Update report status
// ---------------------------------------------------------------------------
export async function updateReportStatus(reportId, status) {
  await updateDoc(doc(db, "reports", reportId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

// ---------------------------------------------------------------------------
// Assign report to worker (creates a task doc)
// ---------------------------------------------------------------------------
export async function assignReportToWorker(reportId, workerId, adminId) {
  const taskRef = await addDoc(collection(db, "tasks"), {
    reportId,
    assignedTo: workerId,
    assignedBy: adminId,
    status: "assigned",
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "reports", reportId), {
    status: "assigned",
    assignedTask: taskRef.id,
    updatedAt: serverTimestamp(),
  });
  return taskRef.id;
}

// ---------------------------------------------------------------------------
// Call Vercel API: Gemini AI analysis
// ---------------------------------------------------------------------------
export async function analyzeReport(reportId, imageURL, description) {
  const res = await fetch("/api/analyze-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reportId, imageURL, description }),
  });
  return res.json();
}

// ---------------------------------------------------------------------------
// Call Vercel API: Duplicate detection
// ---------------------------------------------------------------------------
export async function checkDuplicate(reportId, lat, lng, category) {
  const res = await fetch("/api/check-duplicate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reportId, lat, lng, category }),
  });
  return res.json();
}

// ---------------------------------------------------------------------------
// Call Vercel API: Auto-assign nearest worker
// ---------------------------------------------------------------------------
export async function autoAssignReport(reportId, reportLat, reportLng) {
  const res = await fetch("/api/auto-assign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reportId, reportLat, reportLng }),
  });
  return res.json();
}
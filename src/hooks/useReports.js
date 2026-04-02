import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export function useReports(filters = {}) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.category) params.set("category", filters.category);
      if (filters.reporterId) params.set("reporter_id", filters.reporterId);

      const res = await fetch(`/api/reports?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch reports");
      const data = await res.json();
      setReports(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getToken, filters.status, filters.category, filters.reporterId]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("reports-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "reports" }, () => {
        fetchReports();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchReports]);

  return { reports, loading, error, refetch: fetchReports };
}

export function useReportStats(reports) {
  return useMemo(() => {
    const total = reports.length;
    const pending = reports.filter((r) => r.status === "pending").length;
    const assigned = reports.filter((r) => r.status === "assigned").length;
    const inProgress = reports.filter((r) => r.status === "in_progress").length;
    const resolved = reports.filter((r) => r.status === "resolved").length;

    const byCategory = {};
    const byPriority = {};
    reports.forEach((r) => {
      if (r.category) byCategory[r.category] = (byCategory[r.category] || 0) + 1;
      if (r.priority) byPriority[r.priority] = (byPriority[r.priority] || 0) + 1;
    });

    // Last 7 days timeline
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const count = reports.filter(
        (r) => r.created_at?.startsWith(dateStr)
      ).length;
      last7Days.push({ date: dateStr, count });
    }

    const recent = [...reports]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    return { total, pending, assigned, inProgress, resolved, byCategory, byPriority, last7Days, recent };
  }, [reports]);
}

export async function createReport(token, reportData) {
  const res = await fetch("/api/reports", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(reportData),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create report");
  }

  return res.json();
}

export async function updateReportStatus(token, reportId, status) {
  const res = await fetch(`/api/reports?id=${reportId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) throw new Error("Failed to update report");
  return res.json();
}
export async function analyzeReport(token, { reportId, description, title }) {
  const res = await fetch("/api/analyze-report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      reportId,
      description,
      title,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to analyze report");
  }

  return res.json();
}

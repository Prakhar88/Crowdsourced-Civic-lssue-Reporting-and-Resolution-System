// src/hooks/useWorkerTasks.js
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../services/firebaseConfig";

// ---------------------------------------------------------------------------
// Real-time listener for tasks assigned to a specific worker
// Also fetches the linked report doc for each task
// ---------------------------------------------------------------------------
export function useWorkerTasks(workerId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workerId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "tasks"),
      where("assignedTo", "==", workerId)
    );

    const unsub = onSnapshot(q, async (snap) => {
      const taskDocs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Fetch linked report for each task
      const enriched = await Promise.all(
        taskDocs.map(async (task) => {
          let report = null;
          if (task.reportId) {
            try {
              const reportSnap = await getDoc(doc(db, "reports", task.reportId));
              if (reportSnap.exists()) {
                report = { id: reportSnap.id, ...reportSnap.data() };
              }
            } catch (err) {
              console.warn("Failed to fetch report for task:", task.id, err);
            }
          }
          return { ...task, report };
        })
      );

      setTasks(enriched);
      setLoading(false);
    });

    return () => unsub();
  }, [workerId]);

  return { tasks, loading };
}

// ---------------------------------------------------------------------------
// Update task status + optionally attach after-image URL
// ---------------------------------------------------------------------------
export async function updateTaskStatus(taskId, status, afterImageURL) {
  const updates = {
    status,
    updatedAt: serverTimestamp(),
  };
  if (afterImageURL) {
    updates.afterImageURL = afterImageURL;
  }
  await updateDoc(doc(db, "tasks", taskId), updates);
}

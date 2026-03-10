export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { reportId, reportLat, reportLng } = req.body;

  try {
    const { initializeApp, getApps, getApp } = await import("firebase/app");
    const {
      getFirestore,
      collection,
      query,
      where,
      getDocs,
      addDoc,
      updateDoc,
      doc,
      serverTimestamp,
    } = await import("firebase/firestore");

    const app =
      getApps().length === 0
        ? initializeApp({
            apiKey: process.env.FIREBASE_API_KEY,
            authDomain: process.env.FIREBASE_AUTH_DOMAIN,
            projectId: process.env.FIREBASE_PROJECT_ID,
          })
        : getApp();
    const db = getFirestore(app);

    // Get all available workers
    const workersSnap = await getDocs(
      query(collection(db, "workers"), where("isAvailable", "==", true))
    );

    if (workersSnap.empty) {
      return res
        .status(200)
        .json({ success: false, reason: "No available workers" });
    }

    // Haversine distance calculation (km)
    function haversine(lat1, lng1, lat2, lng2) {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLng = ((lng2 - lng1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    // Find nearest worker
    let nearest = null;
    let minDist = Infinity;
    workersSnap.forEach((d) => {
      const w = d.data();
      const wLat = w.lastLocation?.lat ?? w.location?.lat;
      const wLng = w.lastLocation?.lng ?? w.location?.lng;
      if (wLat != null && wLng != null) {
        const dist = haversine(reportLat, reportLng, wLat, wLng);
        if (dist < minDist) {
          minDist = dist;
          nearest = { id: d.id, ...w };
        }
      }
    });

    // Fallback: pick first available worker if no locations set
    if (!nearest) {
      const first = workersSnap.docs[0];
      nearest = { id: first.id, ...first.data() };
    }

    // Create task doc
    const taskRef = await addDoc(collection(db, "tasks"), {
      reportId,
      assignedTo: nearest.id,
      assignedBy: "auto-assign",
      status: "assigned",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      workerName: nearest.name || null,
    });

    // Update report
    await updateDoc(doc(db, "reports", reportId), {
      status: "assigned",
      assignedTask: taskRef.id,
      assignedWorker: nearest.id,
      assignedWorkerName: nearest.name || null,
      updatedAt: serverTimestamp(),
    });

    // Create notification for worker
    await addDoc(collection(db, "notifications"), {
      recipientId: nearest.id,
      type: "task_assigned",
      reportId,
      taskId: taskRef.id,
      message: `New task assigned to you`,
      read: false,
      createdAt: serverTimestamp(),
    });

    return res.status(200).json({
      success: true,
      workerId: nearest.id,
      workerName: nearest.name,
      taskId: taskRef.id,
    });
  } catch (error) {
    console.error("Auto-assign failed:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

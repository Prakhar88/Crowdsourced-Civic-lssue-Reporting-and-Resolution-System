export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { reportId, lat, lng, category } = req.body;

  try {
    const { initializeApp, getApps, getApp } = await import("firebase/app");
    const {
      getFirestore,
      collection,
      query,
      where,
      getDocs,
      updateDoc,
      doc,
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

    // Get all open reports with same category
    const snap = await getDocs(
      query(
        collection(db, "reports"),
        where("category", "==", category),
        where("status", "!=", "resolved")
      )
    );

    // Check for reports within ~100m (0.001 degrees ≈ 111m)
    let duplicateOf = null;
    snap.forEach((d) => {
      if (d.id === reportId) return;
      const r = d.data();
      if (!r.location?.lat || !r.location?.lng) return;
      if (r.status === "duplicate") return;
      const latDiff = Math.abs(r.location.lat - lat);
      const lngDiff = Math.abs(r.location.lng - lng);
      if (latDiff < 0.001 && lngDiff < 0.001) {
        duplicateOf = d.id;
      }
    });

    if (duplicateOf) {
      await updateDoc(doc(db, "reports", reportId), {
        duplicateOf,
        status: "duplicate",
      });
      return res.status(200).json({ isDuplicate: true, duplicateOf });
    }

    return res.status(200).json({ isDuplicate: false });
  } catch (error) {
    console.error("Duplicate check failed:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

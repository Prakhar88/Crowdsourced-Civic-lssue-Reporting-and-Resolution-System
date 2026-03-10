export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { reportId, imageURL, description } = req.body;

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Fetch image as base64 if imageURL exists
    let imagePart = null;
    if (imageURL) {
      const imageRes = await fetch(imageURL);
      const buffer = await imageRes.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const mimeType = imageRes.headers.get("content-type") || "image/jpeg";
      imagePart = { inlineData: { data: base64, mimeType } };
    }

    const prompt = `
      Analyze this civic issue report.
      Description: "${description}"
      
      Return ONLY valid JSON, no markdown, no explanation:
      {
        "category": "pothole|garbage|streetlight|flooding|vandalism|other",
        "priority": "low|medium|high|critical",
        "confidence": 0.0-1.0,
        "summary": "one sentence max",
        "suggestedAction": "what worker should do, one sentence"
      }
    `;

    const parts = imagePart ? [imagePart, prompt] : [prompt];
    const result = await model.generateContent(parts);
    const text = result.response.text().trim();

    // Strip markdown fences if present
    const clean = text.replace(/```json|```/g, "").trim();
    const aiData = JSON.parse(clean);

    // Write AI results back to Firestore
    const { initializeApp, getApps, getApp } = await import("firebase/app");
    const {
      getFirestore,
      doc,
      updateDoc,
      addDoc,
      collection,
      serverTimestamp,
    } = await import("firebase/firestore");

    const firebaseConfig = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
    };

    const app =
      getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app);

    await updateDoc(doc(db, "reports", reportId), {
      aiCategory: aiData.category,
      aiPriority: aiData.priority,
      aiConfidence: aiData.confidence,
      aiSummary: aiData.summary,
      aiSuggestedAction: aiData.suggestedAction,
      aiStatus: "done",
    });

    // If critical, add to alerts collection
    if (aiData.priority === "critical") {
      await addDoc(collection(db, "alerts"), {
        reportId,
        priority: "critical",
        summary: aiData.summary,
        createdAt: serverTimestamp(),
      });
    }

    return res.status(200).json({ success: true, ...aiData });
  } catch (error) {
    console.error("Gemini analysis failed:", error);

    // Try to mark the report as failed
    try {
      const { initializeApp, getApps, getApp } = await import("firebase/app");
      const { getFirestore, doc, updateDoc } = await import(
        "firebase/firestore"
      );
      const app =
        getApps().length === 0
          ? initializeApp({
              apiKey: process.env.FIREBASE_API_KEY,
              authDomain: process.env.FIREBASE_AUTH_DOMAIN,
              projectId: process.env.FIREBASE_PROJECT_ID,
            })
          : getApp();
      const db = getFirestore(app);
      await updateDoc(doc(db, "reports", req.body.reportId), {
        aiStatus: "failed",
      });
    } catch (_) {
      /* ignore */
    }

    return res.status(500).json({ success: false, error: error.message });
  }
}

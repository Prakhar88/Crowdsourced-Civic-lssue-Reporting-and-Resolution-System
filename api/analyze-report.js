import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const config = { maxDuration: 30 };

// 🔥 Distance function
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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { reportId, description, title } = req.body;

    if (!reportId) {
      return res.status(400).json({ error: "Missing reportId" });
    }

    // 🔥 Get current report
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    const text = (description || title || "").toLowerCase();

    let aiCategory = "other";
    let aiPriority = "medium";
    let aiConfidence = 0.7;
    let aiSummary = "General civic issue detected.";
    let aiSuggestedAction = "Assign appropriate department.";

    // 🔥 CATEGORY + PRIORITY LOGIC
    if (text.includes("pothole") || text.includes("road")) {
      aiCategory = "pothole";
      aiPriority = "high";
      aiConfidence = 0.9;
      aiSummary = "Road damage detected (pothole).";
      aiSuggestedAction = "Dispatch road repair team immediately.";
    } else if (text.includes("garbage") || text.includes("trash")) {
      aiCategory = "garbage";
      aiPriority = "medium";
      aiConfidence = 0.85;
      aiSummary = "Garbage accumulation detected.";
      aiSuggestedAction = "Schedule waste collection.";
    } else if (text.includes("light") || text.includes("streetlight")) {
      aiCategory = "streetlight";
      aiPriority = "medium";
      aiConfidence = 0.8;
      aiSummary = "Streetlight malfunction detected.";
      aiSuggestedAction = "Assign electrical maintenance team.";
    } else if (text.includes("flood") || text.includes("water")) {
      aiCategory = "flooding";
      aiPriority = "critical";
      aiConfidence = 0.95;
      aiSummary = "Flooding reported in area.";
      aiSuggestedAction = "Emergency drainage response required.";
    }

    // 🔥 DUPLICATE DETECTION
    const nearbyReports = await prisma.report.findMany({
      where: {
        NOT: { id: reportId },
        status: { not: "duplicate" },
      },
    });

    let duplicateOf = null;

    for (const r of nearbyReports) {
      if (!r.lat || !r.lng) continue;

      const distance = haversine(report.lat, report.lng, r.lat, r.lng);

      if (distance < 0.05 && r.category === aiCategory) {
        duplicateOf = r.id;
        break;
      }
    }

    // 🔥 SAVE AI RESULT INTO DB
    await prisma.report.update({
      where: { id: reportId },
      data: {
        aiCategory,
        aiPriority,
        aiConfidence,
        aiSummary,
        aiSuggestedAction,
        status: duplicateOf ? "duplicate" : "analyzing",
        duplicateOfId: duplicateOf,
      },
    });

    // 🔥 NOTIFY USER
    if (report.reporterId) {
      await prisma.notification.create({
        data: {
          userId: report.reporterId,
          title: duplicateOf
            ? "Duplicate Report Detected"
            : "Report Analyzed",
          message: duplicateOf
            ? "Your report was marked as duplicate of an existing issue."
            : `Your report has been analyzed (Priority: ${aiPriority}).`,
          type: "report_update",
          metadata: {
            reportId,
            duplicateOf,
          },
        },
      });
    }

    // 🔥 AUTO-ASSIGN ONLY IF NOT DUPLICATE
    if (!duplicateOf) {
      try {
        await fetch("http://localhost:3000/api/auto-assign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reportId }),
        });
      } catch (e) {
        console.error("Auto-assign failed:", e);
      }
    }

    // ✅ RESPONSE
    return res.status(200).json({
      success: true,
      duplicate: !!duplicateOf,
    });

  } catch (error) {
    console.error("AI ERROR:", error);
    return res.status(500).json({ error: "AI analysis failed" });
  }
}
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    const { status, category, reporter_id } = req.query;
    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (reporter_id) where.reporterId = reporter_id;

    const reports = await prisma.report.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Map to snake_case for frontend compatibility
    const mapped = reports.map((r) => ({
      id: r.id,
      reporter_id: r.reporterId,
      title: r.title,
      description: r.description,
      image_url: r.imageUrl,
      lat: r.lat,
      lng: r.lng,
      address: r.address,
      category: r.category,
      status: r.status,
      priority: r.priority,
      ai_category: r.aiCategory,
      ai_priority: r.aiPriority,
      ai_confidence: r.aiConfidence,
      ai_summary: r.aiSummary,
      ai_suggested_action: r.aiSuggestedAction,
      duplicate_of: r.duplicateOfId,
      created_at: r.createdAt,
      updated_at: r.updatedAt,
    }));

    return res.status(200).json(mapped);
  }

  if (req.method === "POST") {
  const { title, description, category, image_url, lat, lng, reporter_id } = req.body;

  const report = await prisma.report.create({
    data: {
      title,
      description,
      category,
      imageUrl: image_url,
      lat,
      lng,
      reporterId: reporter_id,
      status: "pending",
      priority: "medium",
    },
  });

  // ✅ RETURN THE CREATED REPORT (THIS IS CRITICAL)
  return res.status(200).json(report);
}

  if (req.method === "PATCH") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Missing report ID" });

    const data = {};
    const body = req.body;
    if (body.status) data.status = body.status;
    if (body.priority) data.priority = body.priority;
    if (body.category) data.category = body.category;
    if (body.ai_summary) data.aiSummary = body.ai_summary;
    if (body.ai_category) data.aiCategory = body.ai_category;
    if (body.ai_priority) data.aiPriority = body.ai_priority;
    if (body.ai_confidence !== undefined) data.aiConfidence = body.ai_confidence;
    if (body.ai_suggested_action) data.aiSuggestedAction = body.ai_suggested_action;
    if (body.duplicate_of) data.duplicateOfId = body.duplicate_of;

    const report = await prisma.report.update({ where: { id }, data });
    return res.status(200).json(report);
  }

  return res.status(405).json({ error: "Method not allowed" });
}

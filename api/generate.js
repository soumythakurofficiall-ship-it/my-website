const { createStudyPack } = require("../lib/contentGenerator");

const requestLog = new Map();
const windowMs = 60 * 1000;
const maxRequests = Number(process.env.RATE_LIMIT_MAX || 20);

const checkRateLimit = (ip) => {
  const now = Date.now();
  const entries = requestLog.get(ip) || [];
  const recent = entries.filter((stamp) => now - stamp < windowMs);

  if (recent.length >= maxRequests) {
    return false;
  }

  recent.push(now);
  requestLog.set(ip, recent);
  return true;
};

const validatePayload = (body) => {
  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  const classLevel = String(body.classLevel || "");
  const language = String(body.language || "");
  const examMode = Boolean(body.examMode);

  if (!topic || !["6", "7", "8", "9", "10"].includes(classLevel) || !["English", "Hindi"].includes(language)) {
    return { error: "Invalid input. Please provide topic, class (6-10), and language (English/Hindi)." };
  }

  return { topic, classLevel, language, examMode };
};

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
  if (!checkRateLimit(String(ip))) {
    return res.status(429).json({ error: "Too many generation requests. Please wait and try again." });
  }

  try {
    const payload = validatePayload(req.body || {});
    if (payload.error) {
      return res.status(400).json({ error: payload.error });
    }

    const studyPack = await createStudyPack(payload);
    return res.json({ ...payload, ...studyPack });
  } catch (error) {
    console.error("Vercel /api/generate error:", error);
    return res.status(500).json({ error: "Failed to generate study pack. Please try again." });
  }
};

const { createStudyPack } = require("../../lib/contentGenerator");

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

const response = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return response(405, { error: "Method not allowed" });
  }

  const ip = event.headers["x-forwarded-for"] || "unknown";
  if (!checkRateLimit(ip)) {
    return response(429, { error: "Too many generation requests. Please wait and try again." });
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const topic = typeof body.topic === "string" ? body.topic.trim() : "";
    const classLevel = String(body.classLevel || "");
    const language = String(body.language || "");
    const examMode = Boolean(body.examMode);

    if (!topic || !["6", "7", "8", "9", "10"].includes(classLevel) || !["English", "Hindi"].includes(language)) {
      return response(400, {
        error: "Invalid input. Please provide topic, class (6-10), and language (English/Hindi).",
      });
    }

    const studyPack = await createStudyPack({ topic, classLevel, language, examMode });
    return response(200, { topic, classLevel, language, examMode, ...studyPack });
  } catch (error) {
    console.error("Netlify function error:", error);
    return response(500, { error: "Failed to generate study pack. Please try again." });
  }
};

require("dotenv").config();

const express = require("express");
const rateLimit = require("express-rate-limit");
const path = require("path");
const { createStudyPack } = require("./lib/contentGenerator");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname)));

const generateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX || 20),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many generation requests. Please wait and try again.",
  },
});

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

app.post("/generate", generateLimiter, async (req, res) => {
  try {
    const payload = validatePayload(req.body);

    if (payload.error) {
      return res.status(400).json({ error: payload.error });
    }

    const studyPack = await createStudyPack(payload);

    return res.json({
      topic: payload.topic,
      classLevel: payload.classLevel,
      language: payload.language,
      examMode: payload.examMode,
      ...studyPack,
    });
  } catch (error) {
    console.error("/generate error:", error);
    return res.status(500).json({ error: "Failed to generate study pack. Please try again." });
  }
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Exam Booster Hub server running on http://localhost:${port}`);
  });
}

module.exports = app;

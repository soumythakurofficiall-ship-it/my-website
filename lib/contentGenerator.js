const DEFAULT_TTL_MS = 1000 * 60 * 30; // 30 minutes

const cacheStore = new Map();

const buildCacheKey = ({ topic, classLevel, language, examMode }) =>
  [topic.trim().toLowerCase(), classLevel, language, examMode ? "exam" : "normal"].join("::");

const readCache = (key) => {
  const entry = cacheStore.get(key);

  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cacheStore.delete(key);
    return null;
  }

  return entry.value;
};

const writeCache = (key, value, ttlMs = DEFAULT_TTL_MS) => {
  cacheStore.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
};

function generateNotes(topic, classLevel, language) {
  return [
    `${topic} is explained here in simple ${language} for Class ${classLevel} students.`,
    `${topic} is important because it appears in exams and helps connect textbook theory to daily life.`,
    `Always remember: definition, process, and one practical example of ${topic}.`,
    `Write short points and keywords while revising ${topic} to improve scoring speed.`,
  ];
}

function generateMCQs(topic, classLevel, language) {
  const choices = ["A", "B", "C", "D"];

  return Array.from({ length: 10 }, (_, index) => {
    const number = index + 1;
    return {
      question: `${topic} practice MCQ ${number} (${language}, Class ${classLevel})`,
      options: [
        `Option A for question ${number}`,
        `Option B for question ${number}`,
        `Option C for question ${number}`,
        `Option D for question ${number}`,
      ],
      answer: choices[index % choices.length],
    };
  });
}

function generateShortQuestions(topic, classLevel, language) {
  return [
    `Define ${topic} in your own words. (${language})`,
    `Why is ${topic} important for Class ${classLevel}?`,
    `Write two key points related to ${topic}.`,
    `Give one real-life example linked to ${topic}.`,
    `How would you revise ${topic} one day before the exam?`,
  ];
}

function generateRevisionSheet(topic, classLevel, language) {
  return [
    `Quick Revision: ${topic} (Class ${classLevel}, ${language})`,
    `1) Definition in 2 lines`,
    `2) Core concept and process`,
    `3) 4-5 important keywords`,
    `4) Diagram/flow (if applicable)`,
    `5) Last-minute recall points`,
  ];
}

const systemPrompt =
  "You are an expert school tutor. Return valid JSON only with keys: notes (string[]), mcqs (array of {question, options:string[4], answer}), shortQuestions (string[]), revisionSheet (string[]). Keep language simple and age-appropriate.";

const buildUserPrompt = ({ topic, classLevel, language, examMode }) =>
  `Generate study content for topic: ${topic}. Class: ${classLevel}. Language: ${language}. Mode: ${
    examMode ? "Exam Mode" : "Normal"
  }. Return exactly 4 short notes, 10 MCQs with 4 options and correct answer letter, 5 short-answer questions, and a one-page style revision bullet summary.`;

async function generateFromOpenAI(payload) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: buildUserPrompt(payload) },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${body}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI response missing content");
  }

  const parsed = JSON.parse(content);

  return {
    notes: Array.isArray(parsed.notes) ? parsed.notes : [],
    mcqs: Array.isArray(parsed.mcqs) ? parsed.mcqs : [],
    shortQuestions: Array.isArray(parsed.shortQuestions) ? parsed.shortQuestions : [],
    revisionSheet: Array.isArray(parsed.revisionSheet) ? parsed.revisionSheet : [],
  };
}

async function createStudyPack(payload) {
  const cacheKey = buildCacheKey(payload);
  const cached = readCache(cacheKey);

  if (cached) {
    return { ...cached, cached: true };
  }

  let content;

  try {
    content = await generateFromOpenAI(payload);
  } catch (error) {
    console.error("OpenAI generation failed, falling back to template content:", error.message);
  }

  if (!content) {
    content = {
      notes: generateNotes(payload.topic, payload.classLevel, payload.language),
      mcqs: generateMCQs(payload.topic, payload.classLevel, payload.language),
      shortQuestions: generateShortQuestions(payload.topic, payload.classLevel, payload.language),
      revisionSheet: generateRevisionSheet(payload.topic, payload.classLevel, payload.language),
    };
  }

  writeCache(cacheKey, content);

  return { ...content, cached: false };
}

module.exports = {
  createStudyPack,
  generateNotes,
  generateMCQs,
  generateShortQuestions,
  generateRevisionSheet,
};

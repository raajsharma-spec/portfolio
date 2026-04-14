const OpenAI = require("openai");

function buildMockRecommendation({ subjects, performances, weakSubjectIds }) {
  const weak = subjects.filter((s) => weakSubjectIds.some((id) => id.toString() === s._id.toString()));
  const focus = weak[0] || subjects[0];
  const nextSubjectName = focus?.name || "your weakest topic";
  const minutes = focus?.difficulty === "hard" ? 45 : focus?.difficulty === "medium" ? 35 : 25;
  return {
    source: "mock",
    summary: `Prioritize ${nextSubjectName} in your next study block.`,
    studyNext: nextSubjectName,
    suggestedMinutes: minutes,
    timeAllocation: subjects.slice(0, 5).map((s) => ({
      subject: s.name,
      minutes:
        s.difficulty === "hard"
          ? 40
          : s.difficulty === "medium"
            ? 30
            : 20,
    })),
    tips: [
      "Review mistakes from your last assessment before new material.",
      "Use a 25/5 Pomodoro if attention drifts on hard topics.",
    ],
  };
}

async function buildOpenAIRecommendation({ subjects, performances }) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const perfSummary = performances
    .slice(0, 20)
    .map((p) => `${p.subject?.name || "Subject"}: ${p.score}`)
    .join("; ");
  const subjSummary = subjects.map((s) => `${s.name} (${s.difficulty})`).join(", ");

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a study coach. Reply with compact JSON only: { \"studyNext\": string, \"suggestedMinutes\": number, \"timeAllocation\": [{\"subject\": string, \"minutes\": number}], \"tips\": string[] }",
      },
      {
        role: "user",
        content: `Subjects: ${subjSummary}. Recent scores: ${perfSummary || "none"}. Recommend what to study next and time split.`,
      },
    ],
    temperature: 0.4,
  });

  const text = completion.choices[0]?.message?.content?.trim() || "{}";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  let parsed;
  try {
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch {
    throw new Error("Invalid AI JSON");
  }
  return {
    source: "openai",
    summary: `Next: ${parsed.studyNext} (~${parsed.suggestedMinutes} min)`,
    studyNext: parsed.studyNext,
    suggestedMinutes: parsed.suggestedMinutes,
    timeAllocation: parsed.timeAllocation || [],
    tips: parsed.tips || [],
  };
}

async function getRecommendations({ userId, Subject, Performance }) {
  const subjects = await Subject.find({ user: userId });
  const performances = await Performance.find({ user: userId })
    .populate("subject")
    .sort({ recordedAt: -1 })
    .limit(50);

  const bySubject = {};
  for (const p of performances) {
    const sid = p.subject?._id?.toString();
    if (!sid) continue;
    if (!bySubject[sid]) bySubject[sid] = [];
    bySubject[sid].push(p.score);
  }

  const weakSubjectIds = subjects
    .filter((s) => {
      const scores = bySubject[s._id.toString()];
      if (!scores?.length) return true;
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      return avg < 70;
    })
    .map((s) => s._id);

  const withAvg = subjects.map((s) => {
    const scores = bySubject[s._id.toString()] || [];
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
    return { ...s.toObject(), avgScore: avg };
  });

  if (process.env.OPENAI_API_KEY) {
    try {
      const rec = await buildOpenAIRecommendation({
        subjects,
        performances,
      });
      return { ...rec, weakSubjectIds };
    } catch (e) {
      console.warn("OpenAI recommendation failed, using mock:", e.message);
    }
  }

  const mock = buildMockRecommendation({
    subjects: withAvg,
    performances,
    weakSubjectIds,
  });
  return { ...mock, weakSubjectIds };
}

module.exports = { getRecommendations, buildMockRecommendation };

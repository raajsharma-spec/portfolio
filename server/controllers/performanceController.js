const Performance = require("../models/Performance");
const Subject = require("../models/Subject");

async function list(req, res) {
  const rows = await Performance.find({ user: req.user._id })
    .populate("subject")
    .sort({ recordedAt: -1 })
    .limit(200);
  res.json(rows);
}

async function create(req, res) {
  const { subject, score, title, recordedAt } = req.body;
  if (!subject || score == null) return res.status(400).json({ error: "subject and score required" });
  const sub = await Subject.findOne({ _id: subject, user: req.user._id });
  if (!sub) return res.status(400).json({ error: "Invalid subject" });
  const row = await Performance.create({
    user: req.user._id,
    subject,
    score: Math.min(100, Math.max(0, Number(score))),
    title: title || "Assessment",
    recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
  });
  const populated = await Performance.findById(row._id).populate("subject");
  res.status(201).json(populated);
}

async function analytics(req, res) {
  const performances = await Performance.find({ user: req.user._id }).populate("subject");
  const bySubject = {};
  for (const p of performances) {
    const name = p.subject?.name || "Unknown";
    const sid = p.subject?._id?.toString() || name;
    if (!bySubject[sid]) bySubject[sid] = { name, scores: [], sum: 0 };
    bySubject[sid].scores.push(p.score);
    bySubject[sid].sum += p.score;
  }
  const summary = Object.entries(bySubject).map(([id, v]) => ({
    subjectId: id,
    name: v.name,
    count: v.scores.length,
    average: v.scores.length ? Math.round((v.sum / v.scores.length) * 10) / 10 : 0,
    latest: v.scores[0],
  }));
  const weak = summary.filter((s) => s.count > 0 && s.average < 70).sort((a, b) => a.average - b.average);
  res.json({ summary, weakSubjects: weak, totalAssessments: performances.length });
}

module.exports = { list, create, analytics };

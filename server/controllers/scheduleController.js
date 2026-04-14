const Schedule = require("../models/Schedule");
const Subject = require("../models/Subject");
const { generateScheduleItems } = require("../services/scheduleGenerator");

async function getSchedule(req, res) {
  let schedule = await Schedule.findOne({ user: req.user._id }).populate("items.subject");
  if (!schedule) {
    schedule = await Schedule.create({ user: req.user._id, items: [] });
  }
  res.json(schedule);
}

async function replaceSchedule(req, res) {
  const { items } = req.body;
  if (!Array.isArray(items)) return res.status(400).json({ error: "items array required" });
  let schedule = await Schedule.findOne({ user: req.user._id });
  if (!schedule) schedule = await Schedule.create({ user: req.user._id, items: [] });
  schedule.items = items;
  await schedule.save();
  const populated = await Schedule.findById(schedule._id).populate("items.subject");
  res.json(populated);
}

async function generate(req, res) {
  const { hoursPerDay } = req.body;
  if (!hoursPerDay || typeof hoursPerDay !== "object") {
    return res.status(400).json({ error: "hoursPerDay object required (keys 0-6)" });
  }
  const subjects = await Subject.find({ user: req.user._id });
  const Performance = require("../models/Performance");
  const performances = await Performance.find({ user: req.user._id }).populate("subject");
  const bySubject = {};
  for (const p of performances) {
    const sid = p.subject?._id?.toString();
    if (!sid) continue;
    if (!bySubject[sid]) bySubject[sid] = [];
    bySubject[sid].push(p.score);
  }
  const enriched = subjects.map((s) => {
    const scores = bySubject[s._id.toString()] || [];
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 50;
    return { _id: s._id, name: s.name, difficulty: s.difficulty, avgScore: avg };
  });

  const items = generateScheduleItems({ hoursPerDay, subjects: enriched });
  let schedule = await Schedule.findOne({ user: req.user._id });
  if (!schedule) schedule = await Schedule.create({ user: req.user._id, items: [] });
  schedule.items = items;
  await schedule.save();
  const populated = await Schedule.findById(schedule._id).populate("items.subject");
  res.json(populated);
}

module.exports = { getSchedule, replaceSchedule, generate };

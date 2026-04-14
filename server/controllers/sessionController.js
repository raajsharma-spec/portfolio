const StudySession = require("../models/StudySession");
const Subject = require("../models/Subject");
const User = require("../models/User");

function startOfUtcDay(d) {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

async function startSession(req, res) {
  const { subject, mode } = req.body;
  if (subject) {
    const sub = await Subject.findOne({ _id: subject, user: req.user._id });
    if (!sub) return res.status(400).json({ error: "Invalid subject" });
  }
  const session = await StudySession.create({
    user: req.user._id,
    subject: subject || null,
    startedAt: new Date(),
    mode: mode === "free" ? "free" : "pomodoro",
  });
  const populated = await StudySession.findById(session._id).populate("subject");
  res.status(201).json(populated);
}

async function endSession(req, res) {
  const session = await StudySession.findOne({
    _id: req.params.id,
    user: req.user._id,
    endedAt: null,
  });
  if (!session) return res.status(404).json({ error: "Active session not found" });
  const endedAt = new Date();
  session.endedAt = endedAt;
  const minutes = Math.max(
    0,
    Math.round((endedAt - session.startedAt) / 60000)
  );
  session.durationMinutes = minutes;
  session.completed = true;
  await session.save();

  const user = await User.findById(req.user._id);
  const points = Math.min(50, 5 + Math.floor(minutes / 5));
  user.points += points;
  const today = startOfUtcDay(new Date());
  const last = user.lastStudyDate ? startOfUtcDay(user.lastStudyDate) : null;
  if (!last || today.getTime() !== last.getTime()) {
    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    if (last && yesterday.getTime() === last.getTime()) {
      user.streakDays = (user.streakDays || 0) + 1;
    } else {
      user.streakDays = 1;
    }
    user.lastStudyDate = new Date();
  }
  await user.save();

  const populated = await StudySession.findById(session._id).populate("subject");
  res.json({ session: populated, gamification: { pointsEarned: points, totalPoints: user.points, streakDays: user.streakDays } });
}

async function list(req, res) {
  const rows = await StudySession.find({ user: req.user._id })
    .populate("subject")
    .sort({ startedAt: -1 })
    .limit(100);
  res.json(rows);
}

module.exports = { startSession, endSession, list };

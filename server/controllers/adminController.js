const User = require("../models/User");
const StudySession = require("../models/StudySession");
const Performance = require("../models/Performance");

async function stats(req, res) {
  const [userCount, sessionCount, perfCount, admins] = await Promise.all([
    User.countDocuments(),
    StudySession.countDocuments(),
    Performance.countDocuments(),
    User.countDocuments({ role: "admin" }),
  ]);
  const recentUsers = await User.find().sort({ createdAt: -1 }).limit(10).select("name email role createdAt points streakDays");
  res.json({
    userCount,
    sessionCount,
    performanceCount: perfCount,
    adminCount: admins,
    recentUsers,
  });
}

module.exports = { stats };

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Subject = require("../models/Subject");
const Performance = require("../models/Performance");
const Schedule = require("../models/Schedule");
const Reminder = require("../models/Reminder");
const Note = require("../models/Note");
const StudySession = require("../models/StudySession");

async function run() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/smart_study";
  await mongoose.connect(uri);
  console.log("Connected for seed");

  const demoEmails = ["student@demo.com", "admin@demo.com"];
  const oldUsers = await User.find({ email: { $in: demoEmails } });
  const oldIds = oldUsers.map((u) => u._id);
  if (oldIds.length) {
    await Promise.all([
      Subject.deleteMany({ user: { $in: oldIds } }),
      Performance.deleteMany({ user: { $in: oldIds } }),
      Schedule.deleteMany({ user: { $in: oldIds } }),
      Reminder.deleteMany({ user: { $in: oldIds } }),
      Note.deleteMany({ user: { $in: oldIds } }),
      StudySession.deleteMany({ user: { $in: oldIds } }),
    ]);
    await User.deleteMany({ _id: { $in: oldIds } });
  }

  const adminHash = await bcrypt.hash("demo123", 10);
  const studentHash = await bcrypt.hash("demo123", 10);

  await User.create({
    name: "Demo Admin",
    email: "admin@demo.com",
    passwordHash: adminHash,
    role: "admin",
    points: 120,
    streakDays: 5,
  });

  const student = await User.create({
    name: "Demo Student",
    email: "student@demo.com",
    passwordHash: studentHash,
    role: "student",
    points: 80,
    streakDays: 3,
  });

  const subjects = await Subject.insertMany([
    { user: student._id, name: "Mathematics", difficulty: "hard", color: "#6366f1", targetHoursPerWeek: 8 },
    { user: student._id, name: "Physics", difficulty: "medium", color: "#22c55e", targetHoursPerWeek: 6 },
    { user: student._id, name: "English", difficulty: "easy", color: "#f59e0b", targetHoursPerWeek: 4 },
  ]);

  const [math, physics, english] = subjects;

  await Performance.insertMany([
    { user: student._id, subject: math._id, score: 58, title: "Quiz 1" },
    { user: student._id, subject: math._id, score: 62, title: "Quiz 2" },
    { user: student._id, subject: physics._id, score: 78, title: "Lab" },
    { user: student._id, subject: english._id, score: 88, title: "Essay" },
  ]);

  await Schedule.create({
    user: student._id,
    items: [
      {
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "10:30",
        subject: math._id,
        label: "Math deep work",
        priority: 5,
      },
      {
        dayOfWeek: 3,
        startTime: "14:00",
        endTime: "15:00",
        subject: physics._id,
        label: "Physics review",
        priority: 3,
      },
    ],
  });

  await Reminder.create({
    user: student._id,
    title: "Submit calculus problem set",
    type: "assignment",
    dueAt: new Date(Date.now() + 2 * 86400000),
    subject: math._id,
  });

  await Note.create({
    user: student._id,
    subject: physics._id,
    title: "Kinematics cheat sheet",
    description: "v = u + at, s = ut + 0.5at^2",
  });

  console.log("Seed complete.");
  console.log("Student: student@demo.com / demo123");
  console.log("Admin: admin@demo.com / demo123");
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

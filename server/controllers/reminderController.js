const Reminder = require("../models/Reminder");
const Subject = require("../models/Subject");

async function list(req, res) {
  const rows = await Reminder.find({ user: req.user._id }).populate("subject").sort({ dueAt: 1 });
  res.json(rows);
}

async function create(req, res) {
  const { title, type, dueAt, subject, notifyEmailSimulated } = req.body;
  if (!title || !dueAt) return res.status(400).json({ error: "title and dueAt required" });
  if (subject) {
    const sub = await Subject.findOne({ _id: subject, user: req.user._id });
    if (!sub) return res.status(400).json({ error: "Invalid subject" });
  }
  const row = await Reminder.create({
    user: req.user._id,
    title,
    type: type || "study",
    dueAt: new Date(dueAt),
    subject: subject || null,
    notifyEmailSimulated: notifyEmailSimulated !== false,
  });
  if (row.notifyEmailSimulated) {
    console.log(`[email-sim] To ${req.user.email}: Reminder "${row.title}" due ${row.dueAt.toISOString()}`);
  }
  const populated = await Reminder.findById(row._id).populate("subject");
  res.status(201).json(populated);
}

async function update(req, res) {
  const row = await Reminder.findOne({ _id: req.params.id, user: req.user._id });
  if (!row) return res.status(404).json({ error: "Not found" });
  const { title, type, dueAt, completed, subject } = req.body;
  if (title !== undefined) row.title = title;
  if (type) row.type = type;
  if (dueAt) row.dueAt = new Date(dueAt);
  if (typeof completed === "boolean") row.completed = completed;
  if (subject !== undefined) row.subject = subject || null;
  await row.save();
  const populated = await Reminder.findById(row._id).populate("subject");
  res.json(populated);
}

async function remove(req, res) {
  const result = await Reminder.deleteOne({ _id: req.params.id, user: req.user._id });
  if (!result.deletedCount) return res.status(404).json({ error: "Not found" });
  res.status(204).send();
}

module.exports = { list, create, update, remove };

const Subject = require("../models/Subject");

async function list(req, res) {
  const subjects = await Subject.find({ user: req.user._id }).sort({ name: 1 });
  res.json(subjects);
}

async function create(req, res) {
  try {
    const { name, difficulty, color, targetHoursPerWeek } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: "Name is required" });
    const subject = await Subject.create({
      user: req.user._id,
      name: name.trim(),
      difficulty: difficulty || "medium",
      color: color || "#6366f1",
      targetHoursPerWeek: targetHoursPerWeek ?? 5,
    });
    res.status(201).json(subject);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: "Subject name already exists" });
    res.status(500).json({ error: "Could not create subject" });
  }
}

async function update(req, res) {
  const subject = await Subject.findOne({ _id: req.params.id, user: req.user._id });
  if (!subject) return res.status(404).json({ error: "Not found" });
  const { name, difficulty, color, targetHoursPerWeek } = req.body;
  if (name !== undefined) subject.name = name.trim();
  if (difficulty) subject.difficulty = difficulty;
  if (color) subject.color = color;
  if (targetHoursPerWeek != null) subject.targetHoursPerWeek = targetHoursPerWeek;
  await subject.save();
  res.json(subject);
}

async function remove(req, res) {
  const result = await Subject.deleteOne({ _id: req.params.id, user: req.user._id });
  if (!result.deletedCount) return res.status(404).json({ error: "Not found" });
  res.status(204).send();
}

module.exports = { list, create, update, remove };

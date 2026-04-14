const path = require("path");
const fs = require("fs");
const Note = require("../models/Note");
const Subject = require("../models/Subject");
const { uploadDir } = require("../middleware/upload");

async function list(req, res) {
  const notes = await Note.find({ user: req.user._id }).populate("subject").sort({ updatedAt: -1 });
  res.json(notes);
}

async function create(req, res) {
  try {
    const { title, description, subject } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: "Title is required" });
    if (subject) {
      const sub = await Subject.findOne({ _id: subject, user: req.user._id });
      if (!sub) return res.status(400).json({ error: "Invalid subject" });
    }
    const file = req.file;
    const note = await Note.create({
      user: req.user._id,
      subject: subject || null,
      title: title.trim(),
      description: description || "",
      fileName: file?.originalname,
      filePath: file?.filename,
      mimeType: file?.mimetype,
      sizeBytes: file?.size,
    });
    const populated = await Note.findById(note._id).populate("subject");
    res.status(201).json(populated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not create note" });
  }
}

async function download(req, res) {
  const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
  if (!note || !note.filePath) return res.status(404).json({ error: "File not found" });
  const full = path.join(uploadDir, note.filePath);
  if (!fs.existsSync(full)) return res.status(404).json({ error: "Missing file on disk" });
  res.download(full, note.fileName || note.filePath);
}

async function remove(req, res) {
  const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
  if (!note) return res.status(404).json({ error: "Not found" });
  if (note.filePath) {
    const full = path.join(uploadDir, note.filePath);
    try {
      fs.unlinkSync(full);
    } catch {
      /* ignore */
    }
  }
  await note.deleteOne();
  res.status(204).send();
}

module.exports = { list, create, download, remove };

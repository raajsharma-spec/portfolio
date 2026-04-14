const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      default: null,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    fileName: { type: String },
    filePath: { type: String },
    mimeType: { type: String },
    sizeBytes: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);

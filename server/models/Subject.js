const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    color: { type: String, default: "#6366f1" },
    targetHoursPerWeek: { type: Number, default: 5, min: 0 },
  },
  { timestamps: true }
);

subjectSchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Subject", subjectSchema);

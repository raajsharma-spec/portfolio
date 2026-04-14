const mongoose = require("mongoose");

const studySessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      default: null,
    },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date },
    durationMinutes: { type: Number, min: 0 },
    mode: {
      type: String,
      enum: ["pomodoro", "free"],
      default: "pomodoro",
    },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudySession", studySessionSchema);

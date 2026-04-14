const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["study", "assignment", "exam", "other"],
      default: "study",
    },
    dueAt: { type: Date, required: true },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      default: null,
    },
    notifyEmailSimulated: { type: Boolean, default: true },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

reminderSchema.index({ user: 1, dueAt: 1 });

module.exports = mongoose.model("Reminder", reminderSchema);

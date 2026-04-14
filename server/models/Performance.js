const mongoose = require("mongoose");

const performanceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    score: { type: Number, required: true, min: 0, max: 100 },
    title: { type: String, trim: true, default: "Assessment" },
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

performanceSchema.index({ user: 1, recordedAt: -1 });

module.exports = mongoose.model("Performance", performanceSchema);

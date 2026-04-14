const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    points: { type: Number, default: 0 },
    streakDays: { type: Number, default: 0 },
    lastStudyDate: { type: Date },
    themePreference: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "system",
    },
    voiceRemindersEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model("User", userSchema);

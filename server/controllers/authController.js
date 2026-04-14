const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role === "admin" ? "student" : role || "student",
    });

    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Registration failed" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const token = signToken(user);
    res.json({ token, user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Login failed" });
  }
}

async function me(req, res) {
  res.json({ user: req.user });
}

async function updateProfile(req, res) {
  try {
    const { name, themePreference, voiceRemindersEnabled } = req.body;
    if (name) req.user.name = name;
    if (themePreference && ["light", "dark", "system"].includes(themePreference)) {
      req.user.themePreference = themePreference;
    }
    if (typeof voiceRemindersEnabled === "boolean") {
      req.user.voiceRemindersEnabled = voiceRemindersEnabled;
    }
    await req.user.save();
    res.json({ user: req.user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Update failed" });
  }
}

module.exports = { register, login, me, updateProfile, signToken };

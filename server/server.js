const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client")));

app.get("/api", (_req, res) => {
  res.json({ message: "Portfolio contact API is running." });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

app.post("/contact", (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ error: "Name, email, and message are required." });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({ error: "Please provide a valid email." });
  }

  if (message.length < 10) {
    return res
      .status(400)
      .json({ error: "Message should be at least 10 characters long." });
  }

  // In production, connect this to email service or file storage.
  console.log("New contact message:");
  console.log({
    name,
    email,
    message,
    receivedAt: new Date().toISOString(),
  });

  return res.status(200).json({ success: true, message: "Message received." });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

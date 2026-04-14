const Subject = require("../models/Subject");
const Performance = require("../models/Performance");
const { getRecommendations } = require("../services/recommendationService");

async function get(req, res) {
  try {
    const data = await getRecommendations({
      userId: req.user._id,
      Subject,
      Performance,
    });
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not build recommendations" });
  }
}

module.exports = { get };

const express = require("express");
const scheduleController = require("../controllers/scheduleController");
const { auth } = require("../middleware/auth");

const router = express.Router();
router.use(auth(true));

router.get("/", scheduleController.getSchedule);
router.put("/", scheduleController.replaceSchedule);
router.post("/generate", scheduleController.generate);

module.exports = router;

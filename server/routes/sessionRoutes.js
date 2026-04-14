const express = require("express");
const sessionController = require("../controllers/sessionController");
const { auth } = require("../middleware/auth");

const router = express.Router();
router.use(auth(true));

router.get("/", sessionController.list);
router.post("/start", sessionController.startSession);
router.post("/:id/end", sessionController.endSession);

module.exports = router;

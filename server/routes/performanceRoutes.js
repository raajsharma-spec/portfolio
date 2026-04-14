const express = require("express");
const performanceController = require("../controllers/performanceController");
const { auth } = require("../middleware/auth");

const router = express.Router();
router.use(auth(true));

router.get("/", performanceController.list);
router.post("/", performanceController.create);
router.get("/analytics", performanceController.analytics);

module.exports = router;

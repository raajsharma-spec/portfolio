const express = require("express");
const adminController = require("../controllers/adminController");
const { auth } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/admin");

const router = express.Router();
router.use(auth(true), requireAdmin);

router.get("/stats", adminController.stats);

module.exports = router;

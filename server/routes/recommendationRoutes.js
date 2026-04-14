const express = require("express");
const recommendationController = require("../controllers/recommendationController");
const { auth } = require("../middleware/auth");

const router = express.Router();
router.use(auth(true));

router.get("/", recommendationController.get);

module.exports = router;

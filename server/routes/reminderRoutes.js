const express = require("express");
const reminderController = require("../controllers/reminderController");
const { auth } = require("../middleware/auth");

const router = express.Router();
router.use(auth(true));

router.get("/", reminderController.list);
router.post("/", reminderController.create);
router.patch("/:id", reminderController.update);
router.delete("/:id", reminderController.remove);

module.exports = router;

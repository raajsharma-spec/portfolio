const express = require("express");
const subjectController = require("../controllers/subjectController");
const { auth } = require("../middleware/auth");

const router = express.Router();
router.use(auth(true));

router.get("/", subjectController.list);
router.post("/", subjectController.create);
router.patch("/:id", subjectController.update);
router.delete("/:id", subjectController.remove);

module.exports = router;

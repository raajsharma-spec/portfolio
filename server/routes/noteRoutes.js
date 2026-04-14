const express = require("express");
const noteController = require("../controllers/noteController");
const { auth } = require("../middleware/auth");
const { upload } = require("../middleware/upload");

const router = express.Router();
router.use(auth(true));

router.get("/", noteController.list);
router.post("/", upload.single("file"), noteController.create);
router.get("/:id/download", noteController.download);
router.delete("/:id", noteController.remove);

module.exports = router;

const express = require("express");
const { register, login, me, updateProfile } = require("../controllers/authController");
const { auth } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth(true), me);
router.patch("/me", auth(true), updateProfile);

module.exports = router;

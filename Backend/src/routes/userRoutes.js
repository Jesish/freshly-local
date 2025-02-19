const express = require("express");
const { signup, login, getProfile } = require("../controllers/userController");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

// POST route for signup
router.post("/signup", signup);

// POST route for login
router.post("/login", login);

router.get("/profile", protect, getProfile); // Protect this route

module.exports = router;

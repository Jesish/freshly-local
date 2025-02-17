const express = require("express");
const { signup, login } = require("../controllers/userController");
const router = express.Router();

// POST route for signup
router.post("/signup", signup);

// POST route for login
router.post("/login", login);

module.exports = router;

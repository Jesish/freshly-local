const express = require("express");
const {
  signup,
  login,
  getProfile,
  getAllFarmers,
  getAllFarms,
  getFarmById,
} = require("../controllers/userController");
// const { signup, login, getProfile,} = require("../controllers/userController");

const router = express.Router();
const protect = require("../middleware/authMiddleware");

// POST route for signup
router.post("/signup", signup);

// POST route for login
router.post("/login", login);

router.get("/profile", protect, getProfile); // Protect this route
router.get("/farmers", protect, getAllFarmers); //get allfarmers
router.get("/farms", protect, getAllFarms);
router.get("/farm/:id", protect, getFarmById);

module.exports = router;

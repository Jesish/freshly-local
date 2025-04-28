const express = require("express");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");
const {
  signup,
  login,
  getProfile,
  getAllFarmers,
  getAllFarms,
  getFarmById,
  getMe,
  getFarmerStats,
  getFarmerProfile,
  updateProfile,
  forgotPassword,
  verifyOTP,
  resetPassword,
  getPendingFarmers,
  verifyFarmer,
} = require("../controllers/userController");
// const { signup, login, getProfile,} = require("../controllers/userController");
// Rate limiter for forgot password
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per IP
});

// Nodemailer setup

const router = express.Router();
const protect = require("../middleware/authMiddleware");
const admin = (req, res, next) => {
  if (req.user && req.user.userType === "admin") {
    next();
  } else {
    res.status(403).json({ msg: "Admin access required" });
  }
};  

// POST route for signup
router.post("/signup", signup);

// POST route for login
router.post("/login", login);

router.get("/profile", protect, getProfile); // Protect this route
router.get("/farmers", protect, getAllFarmers); //get allfarmers
router.get("/farms", protect, getAllFarms);
router.get("/farm/:id", protect, getFarmById);
router.get("/me", protect, getMe);
router.get("/stats", protect, getFarmerStats);
router.get("/farmerdata", protect, getFarmerProfile);
router.put("/updateProfile", protect, updateProfile);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);
router.get("/pending-farmers", protect, admin, getPendingFarmers);
router.post("/verify-farmer", protect, admin, verifyFarmer);
module.exports = router;

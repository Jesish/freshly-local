const express = require("express");
const router = express.Router();
const {
  initiatePayment,
  verifyPayment,
  createSingleItemPayment,
} = require("../controllers/PaymentController");
const protect = require("../middleware/authMiddleware");

router.post("/initiate-payment", protect, initiatePayment);
router.get("/verify-payment", verifyPayment);
router.post("/single-payment", protect, createSingleItemPayment);

module.exports = router;

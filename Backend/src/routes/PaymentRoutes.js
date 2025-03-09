const express = require("express");
const router = express.Router();
const {
  initiatePayment,
  verifyPayment,
} = require("../controllers/PaymentController");

router.post("/initiate-payment", initiatePayment);
router.get("/verify-payment", verifyPayment);

module.exports = router;

// C:\Users\CHME\Desktop\freshly-local\Backend\src\routes\orderRoutes.js
const express = require("express");
const router = express.Router();
const { getOrders } = require("../controllers/orderController");
const protect = require("../middleware/authMiddleware");

router.get("/", protect, getOrders);

module.exports = router;

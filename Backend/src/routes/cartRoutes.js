const express = require("express");
const router = express.Router();
const { addToCart, getCart } = require("../controllers/cartcontroller");
const {
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/cartcontroller");
const protect = require("../middleware/authMiddleware");

// Route to add a product to the cart
router.post("/cart", protect, addToCart);
router.post("/", protect, getCart);
router.post("/update", protect, updateCartItem);
router.delete("/remove/:productId", protect, removeCartItem);
router.delete("/clear", protect, clearCart);

module.exports = router;

const express = require("express");
const router = express.Router();

const {
  createProduct,
  getFarmerProducts,
  deleteProduct,
} = require("../controllers/productController");
const protect = require("../middleware/authMiddleware");

router.post("/", protect, createProduct); // Add product
router.get("/my-products", protect, getFarmerProducts); // Get farmer products
router.delete("/:id", protect, deleteProduct); // Delete product

module.exports = router;

const express = require("express");
const router = express.Router();

const {
  createProduct,
  getFarmerProducts,
  deleteProduct,
  updateProduct,
  getProductsByFarmer,
  searchProducts,
  getCategories,
} = require("../controllers/productController");
const protect = require("../middleware/authMiddleware");

router.post("/", protect, createProduct); // Add product
router.get("/my-products", protect, getFarmerProducts); // Get farmer products
router.delete("/:id", protect, deleteProduct); // Delete product
router.put("/update/:id", protect, updateProduct); //upadte product
router.get("/farmer/:farmerId", protect, getProductsByFarmer); // Get products by farmer
router.get("/search", protect, searchProducts); // Search products
router.get("/categories", protect, getCategories); // Get all categories

module.exports = router;

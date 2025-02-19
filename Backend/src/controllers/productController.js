const Product = require("../models/Product");

//to add new product
const createProduct = async (req, res) => {
  const { name, description, price, category, stock, image } = req.body;

  console.log("User Info:", req.user); // Debug log

  try {
    if (!req.user || req.user.userType !== "farmer") {
      return res
        .status(403)
        .json({ msg: "Access denied, only farmers can add products" });
    }

    const product = new Product({
      farmer: req.user.user._id, //ink product to logged-in farmer
      name,
      description,
      price,
      category,
      stock,
      image,
    });

    await product.save();
    res.status(201).json({ msg: "Product created successfully", product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

const getFarmerProducts = async (req, res) => {
  try {
    if (!req.user || req.user.userType !== "farmer") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const products = await Product.find({ farmer: req.user.userId });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Farmer only)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    if (product.farmer.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ msg: "Not authorized to delete this product" });
    }

    await product.remove();
    res.json({ msg: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = { createProduct, getFarmerProducts, deleteProduct };

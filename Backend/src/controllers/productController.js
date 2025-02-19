const Product = require("../models/Product");
const User = require("../models/User"); // Import the User model

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
      farmer: req.user._id, //ink product to logged-in farmer
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

    const products = await Product.find({ farmer: req.user._id });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    if (product.farmer.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ msg: "Not authorized to delete this product" });
    }

    await Product.deleteOne({ _id: product._id });

    res.json({ msg: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

const getProductsByFarmer = async (req, res) => {
  const { farmerId } = req.params;

  try {
    // Check if the user is a farmer and prevent them from accessing this route
    if (req.user.userType === "farmer") {
      return res.status(403).json({ msg: "Farmers cannot view this product" });
    }

    // Find products by farmerId
    const products = await Product.find({ farmer: farmerId });

    if (!products || products.length === 0) {
      return res.status(404).json({ msg: "No products found for this farmer" });
    }

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    // Check if the logged-in user is the owner of the product
    if (product.farmer.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ msg: "Not authorized to update this product" });
    }

    // Update product fields based on request body
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body }, // Update only provided fields
      { new: true } // Return the updated product
    );

    res.json({ msg: "Product updated successfully", updatedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = {
  createProduct,
  getFarmerProducts,
  deleteProduct,
  updateProduct,
  getProductsByFarmer,
};

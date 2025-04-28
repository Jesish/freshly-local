const Product = require("../models/Product");
const User = require("../models/User"); // Import the User model
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (["image/jpeg", "image/png"].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG and PNG images are allowed"));
    }
  },
}).single("image");

// Create product
const createProduct = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ msg: err.message });
    }

    const { name, description, price, category, stock, unit } = req.body;
    const image = req.file ? `/Uploads/${req.file.filename}` : undefined;

    try {
      if (!req.user || req.user.userType !== "farmer") {
        return res
          .status(403)
          .json({ msg: "Access denied, only farmers can add products" });
      }

      const product = new Product({
        farmer: req.user._id,
        name,
        description,
        price: parseFloat(price),
        category,
        stock: parseInt(stock),
        unit, // New field
        image,
      });

      await product.save();
      res.status(201).json({ msg: "Product created successfully", product });
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ msg: error.message || "Server error" });
    }
  });
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
  upload(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ msg: err.message });
    }

    const { name, description, price, category, stock, unit } = req.body;
    const image = req.file ? `/Uploads/${req.file.filename}` : undefined;

    try {
      console.log("Updating product ID:", req.params.id); // Debug log
      if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
        console.error("Invalid product ID format:", req.params.id);
        return res.status(400).json({ msg: "Invalid product ID format" });
      }

      const product = await Product.findById(req.params.id);
      if (!product) {
        console.error("Product not found for ID:", req.params.id);
        return res.status(404).json({ msg: "Product not found" });
      }

      if (product.farmer.toString() !== req.user._id.toString()) {
        console.error(
          "Access denied for user:",
          req.user._id,
          "on product:",
          req.params.id
        );
        return res.status(403).json({ msg: "Access denied" });
      }

      const updateData = {
        name,
        description: description || "",
        price: parseFloat(price),
        category,
        stock: parseInt(stock),
        unit,
      };

      if (image) {
        updateData.image = image;
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      console.log("Product updated:", updatedProduct); // Debug log
      res
        .status(200)
        .json({ msg: "Product updated successfully", updatedProduct });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ msg: error.message || "Server error" });
    }
  });
};

const searchProducts = async (req, res) => {
  try {
    const {
      name,
      minPrice,
      maxPrice,
      category,
      farmer,
      page = 1,
      limit = 20,
      sort,
      autocomplete,
    } = req.query;

    const query = {};
    if (name) {
      query.name = { $regex: name, $options: "i" }; // Case-insensitive search
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (category) {
      query.category = category;
    }
    if (farmer) {
      query.farmer = farmer;
    }

    // Sort options
    let sortOptions = {};
    if (sort) {
      const [field, order] = sort.split(":");
      sortOptions[field] = order === "asc" ? 1 : -1;
    } else {
      sortOptions.createdAt = -1; // Default: newest first
    }

    // Adjust limit for autocomplete
    const effectiveLimit = autocomplete ? 5 : Number(limit);

    const products = await Product.find(query)
      .populate("farmer", "farmName farmLocation farmImage")
      .sort(sortOptions)
      .skip((Number(page) - 1) * effectiveLimit)
      .limit(effectiveLimit)
      .lean();

    const formattedProducts = products.map((product) => ({
      ...product,
      farmName: product.farmer?.farmName || "Unknown",
      farmLocation: product.farmer?.farmLocation?.placeName || "Not specified",
      farmImage: product.farmer?.farmImage
        ? `http://localhost:5000${product.farmer.farmImage}`
        : null,
    }));

    res.json(formattedProducts);
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};
module.exports = {
  createProduct,
  getFarmerProducts,
  deleteProduct,
  updateProduct,
  getProductsByFarmer,
  searchProducts,
  getCategories,
};

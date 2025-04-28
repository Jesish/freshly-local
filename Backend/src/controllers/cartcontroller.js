const Cart = require("../models/cart");
const Product = require("../models/Product");
const User = require("../models/User");
const mongoose = require("mongoose");

const addToCart = async (req, res) => {
  try {
    if (!req.user || req.user.userType !== "consumer") {
      return res.status(403).json({ msg: "Only consumers can add to cart" });
    }

    const { productId, quantity, farm_id } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ msg: "Invalid product ID" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    // Ensure product has a unit
    if (!product.unit) {
      product.unit = "kg";
      await product.save();
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        msg: `Insufficient stock: Only ${product.stock} ${product.unit} available for ${product.name}`,
      });
    }

    let cart = await Cart.findOne({ consumer: req.user._id });

    if (!cart) {
      cart = new Cart({ consumer: req.user._id, items: [] });
    }

    const existingItem = cart.items.find((item) =>
      item.product.equals(productId)
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        return res.status(400).json({
          msg: `Insufficient stock: Only ${product.stock} ${product.unit} available for ${product.name}`,
        });
      }
      existingItem.quantity = newQuantity;
      existingItem.unit = product.unit;
    } else {
      cart.items.push({
        product: product._id,
        quantity,
        price: product.price,
        farm_id: product.farmer,
        unit: product.unit,
      });
    }

    await cart.save();
    // Populate product details for response
    await cart.populate("items.product", "name price unit image");
    console.log("Backend: Added to cart:", JSON.stringify(cart.items, null, 2));
    res.json({ msg: "Product added to cart", cart });
  } catch (error) {
    console.error("Backend: Error adding to cart:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

const getCart = async (req, res) => {
  try {
    if (!req.user || req.user.userType !== "consumer") {
      return res
        .status(403)
        .json({ msg: "Only consumers can access their cart" });
    }

    const cart = await Cart.findOne({ consumer: req.user._id }).populate(
      "items.product",
      "name price unit image" // Added image
    );

    if (!cart) {
      return res.json({ msg: "Your cart is empty", cart: { items: [] } });
    }

    console.log(
      "Backend: Sending cart items:",
      JSON.stringify(cart.items, null, 2)
    );
    res.json(cart);
  } catch (error) {
    console.error("Backend: Error fetching cart:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

const updateCartItem = async (req, res) => {
  try {
    if (!req.user || req.user.userType !== "consumer") {
      return res
        .status(403)
        .json({ msg: "Only consumers can update the cart" });
    }

    const { productId, quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ msg: "Quantity must be at least 1" });
    }

    let cart = await Cart.findOne({ consumer: req.user._id });
    if (!cart) {
      return res.status(404).json({ msg: "Cart not found" });
    }

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );
    if (!item) {
      return res.status(404).json({ msg: "Product not found in cart" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        msg: `Insufficient stock: Only ${product.stock} ${product.unit} available for ${product.name}`,
      });
    }

    item.quantity = quantity;
    item.unit = product.unit || "kg";

    await cart.save();
    await cart.populate("items.product", "name price unit image");
    res.json({ msg: "Cart updated successfully", cart });
  } catch (error) {
    console.error("Backend: Error updating cart:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

const removeCartItem = async (req, res) => {
  try {
    if (!req.user || req.user.userType !== "consumer") {
      return res
        .status(403)
        .json({ msg: "Only consumers can remove items from the cart" });
    }

    const { productId } = req.params;

    let cart = await Cart.findOne({ consumer: req.user._id });
    if (!cart) {
      return res.status(404).json({ msg: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();
    await cart.populate("items.product", "name price unit image");
    res.json({ msg: "Item removed from cart", cart });
  } catch (error) {
    console.error("Backend: Error removing cart item:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

const clearCart = async (req, res) => {
  try {
    if (!req.user || req.user.userType !== "consumer") {
      return res.status(403).json({ msg: "Only consumers can clear the cart" });
    }

    await Cart.findOneAndDelete({ consumer: req.user._id });

    res.json({ msg: "Cart cleared successfully", cart: { items: [] } });
  } catch (error) {
    console.error("Backend: Error clearing cart:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};

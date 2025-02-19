const Cart = require("../models/cart");
const Product = require("../models/Product");

const addToCart = async (req, res) => {
  try {
    // Ensure only consumers can add to the cart
    if (!req.user || req.user.userType !== "consumer") {
      return res.status(403).json({ msg: "Only consumers can add to cart" });
    }

    const { productId, quantity } = req.body;

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    // Check if the consumer already has a cart
    let cart = await Cart.findOne({ consumer: req.user._id });
    if (!cart) {
      // If no cart exists, create a new one
      cart = new Cart({ consumer: req.user._id, items: [] });
    }

    // Check if the product already exists in the cart
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );
    if (existingItem) {
      // If the product already exists, just update the quantity
      existingItem.quantity += quantity;
    } else {
      // Otherwise, add a new item to the cart
      cart.items.push({ product: productId, quantity, price: product.price });
    }

    // Save the cart to the database
    await cart.save();

    // Send response with the updated cart
    res.json({ msg: "Product added to cart", cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

const getCart = async (req, res) => {
  try {
    if (!req.user || req.user.userType !== "consumer") {
      return res
        .status(403)
        .json({ msg: "Only consumers can access their cart" });
    }

    // Find the cart for the logged-in consumer
    const cart = await Cart.findOne({ consumer: req.user._id }).populate(
      "items.product",
      "name price"
    );

    if (!cart) {
      return res.json({ msg: "Your cart is empty", cart: { items: [] } });
    }

    res.json(cart);
  } catch (error) {
    console.error(error);
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

    // Find cart
    let cart = await Cart.findOne({ consumer: req.user._id });
    if (!cart) {
      return res.status(404).json({ msg: "Cart not found" });
    }

    // Find item in cart
    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );
    if (!item) {
      return res.status(404).json({ msg: "Product not found in cart" });
    }

    // Update quantity
    item.quantity = quantity;

    await cart.save();
    res.json({ msg: "Cart updated successfully", cart });
  } catch (error) {
    console.error(error);
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

    // Find cart
    let cart = await Cart.findOne({ consumer: req.user._id });
    if (!cart) {
      return res.status(404).json({ msg: "Cart not found" });
    }

    // Filter out the item to remove it
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();
    res.json({ msg: "Item removed from cart", cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

const clearCart = async (req, res) => {
    try {
      if (!req.user || req.user.userType !== "consumer") {
        return res.status(403).json({ msg: "Only consumers can clear the cart" });
      }
  
      await Cart.findOneAndDelete({ consumer: req.user._id });
  
      res.json({ msg: "Cart cleared successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Server error" });
    }
  };
  
module.exports = { addToCart, getCart, updateCartItem, removeCartItem, clearCart };

const Transaction = require("../models/Transaction");
const Cart = require("../models/cart");
const Product = require("../models/Product");
const User = require("../models/User");

const getOrders = async (req, res) => {
  try {
    const orders = await Transaction.find({ consumer: req.user._id })
      .populate("consumer", "fullName")
      .sort({ createdAt: -1 })
      .lean();
    const formattedOrders = orders.map((order) => ({
      ...order,

      consumerName: order.consumer?.fullName || "Unknown",
    }));
    res.json(formattedOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ msg: "Server error" });
  }
}; 

const getFarmerOrders = async (req, res) => {
  try {
    const farmerId = req.user?._id;
    const { status } = req.query;

    if (!farmerId) {
      console.error("No farmerId in req.user:", req.user);
      return res.status(401).json({ msg: "Unauthorized: No user ID" });
    }

    const query = { "items.farm_id": farmerId };
    if (status && status !== "All") {
      query["items.status"] =
        status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }

    const orders = await Transaction.find(query)
      .populate("consumer", "fullName")
      .sort({ createdAt: -1 })
      .lean();

    if (!orders || orders.length === 0) {
      return res.json([]);
    }

    const formattedOrders = orders.map((order) => ({
      ...order,
      consumerName: order.consumer?.fullName || "Unknown",
      items: order.items.filter(
        (item) => item.farm_id.toString() === farmerId.toString()
      ),
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error("Error fetching farmer orders:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { transactionUuid } = req.params;
    const { status, deliveryDate } = req.body;
    const farmerId = req.user._id;

    const order = await Transaction.findOne({ transactionUuid });
    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    let updated = false;
    order.items = order.items.map((item) => {
      if (item.farm_id.toString() === farmerId.toString()) {
        updated = true;
        return {
          ...item,
          status: status || item.status,
          deliveryDate: deliveryDate
            ? new Date(deliveryDate)
            : item.deliveryDate,
        };
      }
      return item;
    });

    if (!updated) {
      return res
        .status(403)
        .json({ msg: "Unauthorized: No items for this farmer" });
    }

    await order.save();

    const populatedOrder = await Transaction.findOne({ transactionUuid })
      .populate("consumer", "fullName")
      .lean();

    const formattedOrder = {
      ...populatedOrder,
      consumerName: populatedOrder.consumer?.fullName || "Unknown",
    };

    res.json(formattedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

const createOrder = async (req, res) => {
  try {
    if (!req.user || req.user.userType !== "consumer") {
      return res.status(403).json({ msg: "Only consumers can create orders" });
    }

    const { deliveryDate, deliveryLocation } = req.body;

    if (!deliveryLocation || !deliveryLocation.address) {
      return res
        .status(400)
        .json({ msg: "Delivery location address is required" });
    }

    const cart = await Cart.findOne({ consumer: req.user._id }).populate(
      "items.product"
    );
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ msg: "Cart is empty" });
    }

    // Validate stock
    for (const item of cart.items) {
      if (!item.product) {
        return res.status(404).json({ msg: `Product not found for item` });
      }
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          msg: `Insufficient stock: Only ${item.product.stock} ${item.unit} available for ${item.product.name}`,
        });
      }
    }

    // Calculate total amount
    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Create transaction
    const transaction = new Transaction({
      transactionUuid: `TX-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      consumer: req.user._id,
      items: cart.items.map((item) => ({
        product: {
          _id: item.product._id,
          name: item.product.name,
          price: item.product.price,
        },
        quantity: item.quantity,
        price: item.price,
        farm_id: item.farm_id,
        unit: item.unit,
        status: "Pending",
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
      })),
      totalAmount,
      deliveryLocation,
    });

    // Reduce stock
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      product.stock -= item.quantity;
      await product.save();
    }

    // Clear cart
    await Cart.findOneAndDelete({ consumer: req.user._id });

    await transaction.save();

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate("consumer", "fullName")
      .lean();

    const formattedTransaction = {
      ...populatedTransaction,
      consumerName: populatedTransaction.consumer?.fullName || "Unknown",
    };

    res
      .status(201)
      .json({ msg: "Order created successfully", order: formattedTransaction });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

module.exports = { getOrders, getFarmerOrders, updateOrder, createOrder };

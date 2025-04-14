// C:\Users\CHME\Desktop\freshly-local\Backend\src\controllers\orderController.js
const Transaction = require("../models/Transaction");
const user = require("../models/User");

const getOrders = async (req, res) => {
  try {
    const orders = await Transaction.find({ consumer: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
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

    console.log("Logged-in farmer ID:", farmerId);
    console.log("Status filter:", status);

    const query = {
      "items.farm_id": farmerId, // Match farmerId in items array
    };
    if (status && status !== "All") {
      query.status =
        status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }

    console.log("Query:", query);

    const orders = await Transaction.find(query)
      .populate("consumer", "fullName")
      .sort({ createdAt: -1 })
      .lean();

    console.log("Found orders:", orders);

    if (!orders || orders.length === 0) {
      console.log("No orders found for query:", query);
      return res.json([]);
    }

    const formattedOrders = orders.map((order) => ({
      ...order,
      consumerName: order.consumer?.fullName || "Unknown",
      // Filter items for this farmer (optional, if multiple farmers per order)
      items: order.items.filter(
        (item) => item.farm_id.toString() === farmerId.toString()
      ),
    }));

    console.log("Formatted orders:", formattedOrders);
    res.json(formattedOrders);
  } catch (error) {
    console.error("Error fetching farmer orders:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};
//Farmner order controller


const updateOrder = async (req, res) => {
  try {
    const { transactionUuid } = req.params;
    const { status, deliveryDate } = req.body;
    const farmerId = req.user._id;

    const query = {
      transactionUuid,
      "items.farm_id": farmerId,
    };

    const updates = {};
    if (status) updates.status = status;
    if (deliveryDate) updates.deliveryDate = new Date(deliveryDate);

    const order = await Transaction.findOneAndUpdate(query, updates, {
      new: true,
    }).populate("consumer", "fullName");

    if (!order) {
      return res.status(404).json({ msg: "Order not found or unauthorized" });
    }

    const formattedOrder = {
      ...order.toObject(),
      consumerName: order.consumer?.fullName || "Unknown",
    };

    res.json(formattedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

module.exports = { getOrders, getFarmerOrders,updateOrder };

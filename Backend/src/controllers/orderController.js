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
    const farmerId = req.user._id;
    const { status } = req.query;

    console.log("Logged-in farmer ID:", farmerId); // Debug
    console.log("Status filter:", status); // Debug

    const query = { farmId: farmerId };
    if (status) query.status = status;

    console.log("Query:", query); // Debug

    const orders = await Transaction.find(query)
      .populate("consumer", "fullName")
      .sort({ createdAt: -1 });

    console.log("Found orders:", orders); // Debug

    const formattedOrders = orders.map((order) => ({
      ...order.toObject(),
      consumerName: order.consumer?.fullName || "Unknown",
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error("Error fetching farmer orders:", error);
    res.status(500).json({ msg: "Server error" });
  }
};
//Farmner order controller

module.exports = { getOrders, getFarmerOrders };

// C:\Users\CHME\Desktop\freshly-local\Backend\src\controllers\orderController.js
const Transaction = require("../models/Transaction");

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

module.exports = { getOrders };

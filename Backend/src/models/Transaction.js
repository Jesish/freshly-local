const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  consumer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, // User who made the purchase
  items: [
    {
      product: {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
      },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }, // Price per item
    },
  ],
  totalAmount: { type: Number, required: true },
  transactionUuid: { type: String, required: true },
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deliveryDate: { type: Date },
  // isCartOrder: { type: Boolean, default: false }, // New field
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Transaction", transactionSchema);

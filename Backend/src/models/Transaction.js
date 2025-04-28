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
      unit: { type: String, enum: ["kg", "dozen", "piece"], required: true },

      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      farm_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      }, // Price per item
      status: {
        type: String,
        enum: ["Pending", "On the way", "Delivered", "Unpaid"],
        default: "Pending",
      },
      deliveryDate: { type: Date }, // Per-product delivery date
    },
  ],
  totalAmount: { type: Number, required: true },
  transactionUuid: { type: String, required: true },
  status: {
    type: String,
    enum: ["Pending", "On the way", "Delivered", "Unpaid"],
    default: "Pending",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deliveryDate: { type: Date },
  deliveryLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, required: true },
  },
  // isCartOrder: { type: Boolean, default: false }, // New field
});

module.exports = mongoose.model("Transaction", transactionSchema);

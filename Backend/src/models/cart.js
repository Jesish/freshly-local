const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
  {
    consumer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Link to the consumer (User model)
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product", // Link to the Product model
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Cart", CartSchema);

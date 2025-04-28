const crypto = require("crypto");
const Transaction = require("../models/Transaction");
const Product = require("../models/Product");
const Cart = require("../models/cart");
require("dotenv").config();
const mongoose = require("mongoose");

// Generate HMAC SHA256 Signature
const generateSignature = (data, secret) => {
  return crypto.createHmac("sha256", secret).update(data).digest("base64");
};

// Initiate Payment (Checkout from Cart)
const initiatePayment = async (req, res) => {
  try {
    const { cart, userId, totalAmount, deliveryLocation } = req.body;
    if (
      !cart ||
      !userId ||
      !totalAmount ||
      !deliveryLocation ||
      !deliveryLocation.address
    ) {
      return res.status(400).json({
        msg: "Cart, userId, totalAmount, and deliveryLocation.address are required",
      });
    }

    // Validate cart items and stock
    for (const item of cart) {
      const product = await Product.findById(item.product._id);
      if (!product) {
        return res
          .status(404)
          .json({ msg: `Product ${item.product.name} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          msg: `Insufficient stock: Only ${product.stock} ${product.unit} available for ${product.name}`,
        });
      }
    }

    const transactionUuid = `TX-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const paymentData = {
      amount: totalAmount.toString(),
      tax_amount: "0",
      total_amount: totalAmount.toString(),
      transaction_uuid: transactionUuid,
      product_code: process.env.ESEWA_MERCHANT_ID,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: process.env.SUCCESS_URL,
      failure_url: process.env.FAILURE_URL,
      signed_field_names: "total_amount,transaction_uuid,product_code",
    };

    const dataString = `total_amount=${paymentData.total_amount},transaction_uuid=${paymentData.transaction_uuid},product_code=${paymentData.product_code}`;
    const signature = generateSignature(
      dataString,
      process.env.ESEWA_SECRET_KEY
    );
    paymentData.signature = signature;

    const transaction = new Transaction({
      consumer: userId,
      items: cart.map((item) => ({
        product: {
          _id: item.product._id,
          name: item.product.name,
          price: item.product.price,
        },
        quantity: item.quantity,
        price: item.price,
        farm_id: item.farm_id,
        unit: item.unit,
      })),
      deliveryLocation,
      totalAmount,
      transactionUuid,
      status: "Pending",
    });

    // Reduce stock
    for (const item of cart) {
      const product = await Product.findById(item.product._id);
      product.stock -= item.quantity;
      await product.save();
    }

    await transaction.save();

    // Clear cart
    await Cart.findOneAndUpdate({ consumer: userId }, { items: [] });

    res.json(paymentData);
  } catch (error) {
    console.error("Error initiating payment:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// Single-Item Payment ("Buy Now")
const createSingleItemPayment = async (req, res) => {
  try {
    const { productId, quantity = 1, deliveryLocation } = req.body;
    const userId = req.user._id;

    if (!productId || !deliveryLocation || !deliveryLocation.address) {
      return res
        .status(400)
        .json({ msg: "Product ID and deliveryLocation.address are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ msg: "Invalid product ID" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    if (!product.unit) {
      product.unit = "kg";
      await product.save();
      console.log(`Updated product ${product.name} with unit: kg`);
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        msg: `Insufficient stock: Only ${product.stock} ${product.unit} available for ${product.name}`,
      });
    }

    const totalAmount = product.price * quantity;
    const transactionUuid = `TX-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const paymentData = {
      amount: totalAmount.toString(),
      tax_amount: "0",
      total_amount: totalAmount.toString(),
      transaction_uuid: transactionUuid,
      product_code: process.env.ESEWA_MERCHANT_ID,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: process.env.SUCCESS_URL,
      failure_url: process.env.FAILURE_URL,
      signed_field_names: "total_amount,transaction_uuid,product_code",
    };

    const dataString = `total_amount=${paymentData.total_amount},transaction_uuid=${paymentData.transaction_uuid},product_code=${paymentData.product_code}`;
    const signature = generateSignature(
      dataString,
      process.env.ESEWA_SECRET_KEY
    );
    paymentData.signature = signature;

    const transaction = new Transaction({
      consumer: userId,
      items: [
        {
          product: {
            _id: product._id,
            name: product.name,
            price: product.price,
          },
          quantity,
          price: product.price,
          farm_id: product.farmer,
          unit: product.unit,
        },
      ],
      deliveryLocation,
      totalAmount,
      transactionUuid,
      status: "Pending",
    });

    // Reduce stock
    product.stock -= quantity;
    await product.save();

    await transaction.save();

    res.json(paymentData);
  } catch (error) {
    console.error("Error creating single-item payment:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// Verify Payment
const verifyPayment = async (req, res) => {
  const { data } = req.query;

  try {
    if (!data) {
      console.log("No data in query");
      return res.redirect(process.env.FAILURE_URL);
    }

    const decodedData = JSON.parse(Buffer.from(data, "base64").toString());
    const {
      transaction_code,
      status,
      total_amount,
      transaction_uuid,
      product_code,
      signature,
    } = decodedData;

    const dataString = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const expectedSignature = generateSignature(
      dataString,
      process.env.ESEWA_SECRET_KEY
    );

    if (signature !== expectedSignature) {
      console.log("Invalid signature:", { signature, expectedSignature });
      return res.redirect(process.env.FAILURE_URL);
    }

    const transaction = await Transaction.findOne({
      transactionUuid: transaction_uuid,
    });
    if (!transaction) {
      console.log("Transaction not found for UUID:", transaction_uuid);
      return res.redirect(process.env.FAILURE_URL);
    }

    if (
      status === "COMPLETE" &&
      transaction.totalAmount === parseFloat(total_amount)
    ) {
      transaction.status = "Delivered";
      transaction.updatedAt = Date.now();
      transaction.deliveryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      await transaction.save();

      // Clear cart if it was a cart order
      await Cart.findOneAndUpdate(
        { consumer: transaction.consumer },
        { items: [] }
      );

      return res.redirect(
        `${process.env.SUCCESS_URL}?transactionUuid=${transaction_uuid}`
      );
    } else {
      transaction.status = "Unpaid";
      await transaction.save();
      return res.redirect(process.env.FAILURE_URL);
    }
  } catch (error) {
    console.error("Payment verification failed:", error);
    return res.redirect(process.env.FAILURE_URL);
  }
};

module.exports = { initiatePayment, verifyPayment, createSingleItemPayment };

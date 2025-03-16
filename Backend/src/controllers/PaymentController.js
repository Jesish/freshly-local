const crypto = require("crypto");
const Transaction = require("../models/Transaction");
const Product = require("../models/Product");
require("dotenv").config();

// Generate HMAC SHA256 Signature
const generateSignature = (data, secret) => {
  return crypto.createHmac("sha256", secret).update(data).digest("base64");
};

// Initiate Payment
const initiatePayment = async (req, res) => {
  const { cart, userId, totalAmount } = req.body;
  const transactionUuid = Date.now().toString();
  console.log(totalAmount);

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
  const signature = generateSignature(dataString, process.env.ESEWA_SECRET_KEY);
  paymentData.signature = signature;

  const transaction = new Transaction({
    consumer: userId,
    items: cart,
    totalAmount,
    transactionUuid,
    status: "pending", // Add initial status
  });
  await transaction.save();

  res.json(paymentData);
};

// Single-Item Payment
const createSingleItemPayment = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    if (!productId) {
      return res.status(400).json({ msg: "Product ID is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    const totalAmount = product.price;
    const transactionUuid = Date.now().toString();

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
          quantity: 1,
          price: product.price,
        },
      ],
      totalAmount,
      transactionUuid,
      status: "pending", // Add initial status
    });
    await transaction.save();

    res.json(paymentData);
  } catch (error) {
    console.error("Error creating single-item payment:", error);
    res.status(500).json({ msg: "Server error" });
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

    // Decode the base64 data from eSewa
    const decodedData = JSON.parse(Buffer.from(data, "base64").toString());
    const {
      transaction_code,
      status,
      total_amount,
      transaction_uuid,
      product_code,
      signature,
    } = decodedData;

    console.log("eSewa Response:", decodedData); // Debug log

    // Verify the signature
    const dataString = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const expectedSignature = generateSignature(
      dataString,
      process.env.ESEWA_SECRET_KEY
    );

    if (signature !== expectedSignature) {
      console.log("Invalid signature:", { signature, expectedSignature });
      return res.redirect(process.env.FAILURE_URL);
    }

    // Find the transaction
    const transaction = await Transaction.findOne({
      transactionUuid: transaction_uuid,
    });
    if (!transaction) {
      console.log("Transaction not found for UUID:", transaction_uuid);
      return res.redirect(process.env.FAILURE_URL);
    }

    console.log("Transaction before update:", transaction); // Debug log

    // Update status and clear cart if successful
    if (
      status === "COMPLETE" &&
      transaction.totalAmount === parseFloat(total_amount)
    ) {
      transaction.status = "completed"; // Changed to "completed"
      await transaction.save();

      console.log("Transaction after update:", transaction); // Debug log

      // Clear the cart
      const cartUpdate = await Cart.findOneAndUpdate(
        { consumer: transaction.consumer },
        { items: [] },
        { new: true }
      );
      console.log("Cart cleared:", cartUpdate);

      return res.redirect(
        `${process.env.SUCCESS_URL}?farmId=${transaction.farmId}`
      );
    } else {
      transaction.status = "unpaid";
      await transaction.save();
      console.log("Payment incomplete, status set to unpaid:", transaction);
      return res.redirect(process.env.FAILURE_URL);
    }
  } catch (error) {
    console.error("Payment verification failed:", error);
    return res.redirect(process.env.FAILURE_URL);
  }
};

module.exports = { initiatePayment, verifyPayment, createSingleItemPayment };

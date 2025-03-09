const crypto = require("crypto");
const Transaction = require("../models/Transaction");
require("dotenv").config();

// Generate HMAC SHA256 Signature
const generateSignature = (data, secret) => {
  return crypto.createHmac("sha256", secret).update(data).digest("base64");
};

// Initiate Payment
const initiatePayment = async (req, res) => {
  const { cart, userId, totalAmount } = req.body; // cart is an array of product objects
  const transactionUuid = Date.now().toString();
  console.log(totalAmount);

  // Create the payment data for the whole cart
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

  // Generate the signature for the payment data
  const dataString = `total_amount=${paymentData.total_amount},transaction_uuid=${paymentData.transaction_uuid},product_code=${paymentData.product_code}`;
  const signature = generateSignature(dataString, process.env.ESEWA_SECRET_KEY);
  paymentData.signature = signature;

  // Save the transaction for the entire cart
  console.log(userId);
  const transaction = new Transaction({
    consumer: userId,
    items: cart, // Save entire cart in the transaction
    totalAmount,
    transactionUuid,
    // Optional, link to user
  });
  await transaction.save();

  // Return the payment URL
  res.json(paymentData);
};

const verifyPayment = async (req, res) => {
  const { transaction_uuid, amount } = req.query;

  try {
    const response = await axios.get(
      `${process.env.ESEWA_STATUS_CHECK_URL}?product_code=${process.env.ESEWA_MERCHANT_ID}&total_amount=${amount}&transaction_uuid=${transaction_uuid}`
    );
    const status = response.data.status;

    // Update the transaction status in the database
    const transaction = await Transaction.findOneAndUpdate(
      { transactionUuid: transaction_uuid },
      { status: status === "COMPLETE" ? "success" : "failed" },
      { new: true }
    );

    res.redirect(
      status === "COMPLETE" ? process.env.SUCCESS_URL : process.env.FAILURE_URL
    );
  } catch (error) {
    console.error("Payment verification failed:", error);
    res.redirect(process.env.FAILURE_URL);
  }
};
module.exports = { initiatePayment, verifyPayment };

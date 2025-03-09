import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const PaymentPage = () => {
  const { state } = useLocation();
  const [message, setMessage] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [totalAmounts, setTotalAmounts] = useState(0);
  const [consumer, setconsumer] = useState("");

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    const total = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    setTotalAmounts(total);
  }, [cartItems]);

  const fetchCart = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/getcart", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("Cart API Response:", data);
      setCartItems(data.items || []);
      setconsumer(data.consumer || "");
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCartItems([]);
    }
  };

  const handlePayment = async () => {
    console.log(cartItems);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/payment/initiate-payment",
        {
          cart: cartItems,
          userId: consumer,
          totalAmount: totalAmounts,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const paymentData = response.data; // Get payment details from the backend

      // Create a form dynamically to submit the data as POST
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form"; // Use frontend .env variable

      Object.keys(paymentData).forEach((key) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = paymentData[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit(); // Submit the form
    } catch (error) {
      setMessage("Error initiating payment: " + error.message);
    }
  };

  if (!cartItems.length) return <div>Loading cart...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Checkout</h2>
      <p>Total Amount: NPR {totalAmounts}</p>
      <button
        onClick={handlePayment}
        className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
      >
        Pay with eSewa
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default PaymentPage;

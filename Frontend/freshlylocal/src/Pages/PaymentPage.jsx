import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Added useNavigate
import axios from "axios";
import { ShoppingBag, ArrowLeft } from "lucide-react"; // Replaced CreditCard with ShoppingBag

const PaymentPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate(); // Added for back navigation
  const [message, setMessage] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [totalAmounts, setTotalAmounts] = useState(0);
  const [consumer, setConsumer] = useState("");

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
      setCartItems(data.items || []);
      setConsumer(data.consumer || "");
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCartItems([]);
    }
  };

  const handlePayment = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/payment/initiate-payment", // Fixed to match your routes
        {
          cart: cartItems,
          userId: consumer,
          totalAmount: totalAmounts,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const paymentData = response.data;

      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

      Object.keys(paymentData).forEach((key) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = paymentData[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      setMessage("Error initiating payment: " + error.message);
    }
  };

  if (!cartItems.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-green-600 to-green-800 text-white flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingBag size={28} /> Confirm Your Order
          </h2>
          <button
            onClick={() => navigate(-1)} // Back to CartModal or previous page
            className="flex items-center gap-2 hover:bg-green-900 p-2 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} /> Back
          </button>
        </div>

        {/* Order Summary */}
        <div className="p-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            Order Details
          </h3>
          <div className="space-y-6">
            <p className="text-gray-700 text-lg">
              <span className="font-medium">Total Items:</span>{" "}
              {cartItems.length}
            </p>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-4 font-semibold text-gray-700">Product</th>
                    <th className="p-4 font-semibold text-gray-700">
                      Quantity
                    </th>
                    <th className="p-4 font-semibold text-gray-700 text-right">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.product._id} className="border-t">
                      <td className="p-4 text-gray-800">{item.product.name}</td>
                      <td className="p-4 text-gray-800">{item.quantity}</td>
                      <td className="p-4 text-right text-gray-800">
                        NPR {(item.product.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between text-lg font-semibold text-gray-800 mt-6">
              <span>Total Amount:</span>
              <span>NPR {totalAmounts.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            className="w-full mt-8 bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 transition-all duration-200 shadow-lg text-lg font-semibold flex items-center justify-center gap-2"
          >
            <ShoppingBag size={20} /> Confirm and Pay with eSewa
          </button>
          {message && (
            <p className="mt-4 text-center text-red-500">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;

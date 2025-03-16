import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, ShoppingBag } from "lucide-react";

function SuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
        <CheckCircle size={64} className="text-green-600 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase! Your order has been placed and is
          awaiting farmer confirmation.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/orders")}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md flex items-center justify-center gap-2"
          >
            <ShoppingBag size={20} /> View Order History
          </button>
          <button
            onClick={() => navigate("/ProductPage/")} // Replace with dynamic farmId later
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-all duration-200"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default SuccessPage;

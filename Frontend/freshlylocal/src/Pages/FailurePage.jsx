import React from "react";
import { useNavigate } from "react-router-dom";
import { XCircle, ArrowLeft } from "lucide-react";

function FailurePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
        <XCircle size={64} className="text-red-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Payment Failed
        </h1>
        <p className="text-gray-600 mb-6">
          Sorry, something went wrong with your payment. Please try again or
          adjust your cart.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/payment")}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate(-1)} // Back to CartModal or PaymentPage
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={20} /> Back to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default FailurePage;

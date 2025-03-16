import React, { useState, useEffect } from "react";
import axios from "axios";
import { Package, Clock, Truck, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/orders", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock size={20} className="text-yellow-500" />;
      case "completed":
        return <Package size={20} className="text-blue-500" />;
      case "on the way":
        return <Truck size={20} className="text-orange-500" />;
      case "delivered":
        return <CheckCircle size={20} className="text-green-500" />;
      case "unpaid":
        return <XCircle size={20} className="text-red-500" />;
      default:
        return <Clock size={20} className="text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Package size={32} /> Your Order History
          </h1>
          <button
            onClick={() => navigate("/ProductPage/1")} // Replace with dynamic farmId later
            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-all duration-200"
          >
            Continue Shopping
          </button>
        </div>
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              No orders yet. Start shopping to see your history here!
            </p>
            <button
              onClick={() => navigate("/ProductPage/1")}
              className="mt-4 text-green-600 hover:underline"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.transactionUuid}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      Order #{order.transactionUuid.slice(-6)}
                    </h2>
                    <p className="text-gray-600">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <span className="text-lg font-medium capitalize">
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-gray-700">
                    <span className="font-medium">Items:</span>{" "}
                    {order.items.length}
                  </p>
                  <p className="text-gray-700 mt-2">
                    <span className="font-medium">Total:</span> NPR{" "}
                    {order.totalAmount.toFixed(2)}
                  </p>
                  <button
                    onClick={() => alert(JSON.stringify(order.items, null, 2))} // Placeholder for details
                    className="mt-4 text-green-600 hover:underline"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  ShoppingBag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [farmerDetails, setFarmerDetails] = useState(null);
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

  const fetchFarmerDetails = async (id) => {
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/users/farm/${id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setFarmerDetails({
        farmName: data.farmName,
        fullName: data.farmerName,
        farmLocation: data.farmLocation,
      });
    } catch (error) {
      console.error("Error fetching farmer details:", error);
      setFarmerDetails({
        farmName: "Unknown Farm",
        fullName: "Unknown Farmer",
      });
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

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    console.log(order);
    
    if (order.items.length > 0) {
      fetchFarmerDetails(order.items[0].farm_id); // Get farm_id from the first item
    }
  };
  

  const closeModal = () => {
    setSelectedOrder(null);
    setFarmerDetails(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
            <Package size={36} className="text-green-600" /> Order History
          </h1>
          <button
            onClick={() => navigate("/")}
            className="bg-green-600 text-white py-2 px-6 rounded-full hover:bg-green-700 transition-all duration-300 flex items-center gap-2 shadow-md"
          >
            <ShoppingBag size={20} /> Continue Shopping
          </button>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-sm">
            <p className="text-gray-600 text-xl">
              No orders yet. Start shopping to see your history here!
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 text-green-600 hover:text-green-800 font-medium transition-colors"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <div
                key={order.transactionUuid}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      Order #{order.transactionUuid.slice(-6)}
                    </h2>
                    <p className="text-gray-500 text-sm">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusIcon(order.status)}
                    <span className="text-md font-medium text-gray-700 capitalize">
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-gray-700">
                    <p>
                      <span className="font-medium">Items:</span>{" "}
                      {order.items.length}
                    </p>
                    <p>
                      <span className="font-medium">Total:</span> NPR{" "}
                      {order.totalAmount.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleViewDetails(order)}
                    className="mt-4 text-green-600 hover:text-green-800 font-medium transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for Order Details */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Order #{selectedOrder.transactionUuid.slice(-6)} Details
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle size={24} />
                </button>
              </div>
              <div className="space-y-6">
                {/* Order Info */}
                <div>
                  <p className="text-gray-600">
                    <span className="font-medium">Placed on:</span>{" "}
                    {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Status:</span>{" "}
                    <span className="capitalize">{selectedOrder.status}</span>
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Total:</span> NPR{" "}
                    {selectedOrder.totalAmount.toFixed(2)}
                  </p>
                </div>

                {/* Farmer Info */}
                {farmerDetails && (
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Purchased From
                    </h3>
                    <p className="text-gray-600">
                      <span className="font-medium">Farm:</span>{" "}
                      {farmerDetails.farmName}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Farmer:</span>{" "}
                      {farmerDetails.fullName}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Location:</span>{" "}
                      {farmerDetails.farmLocation || "Not specified"}
                    </p>
                  </div>
                )}

                {/* Items List */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-800">Items</h3>
                  <ul className="space-y-3 mt-2">
                    {selectedOrder.items.map((item) => (
                      <li
                        key={item.product._id}
                        className="flex justify-between text-gray-700"
                      >
                        <span>
                          {item.product.name} (x{item.quantity})
                        </span>
                        <span>
                          NPR {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="mt-6 w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;

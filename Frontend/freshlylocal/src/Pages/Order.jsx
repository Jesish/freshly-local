import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Save,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import axios from "axios";
import Sidebar from "./Sidebar";

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editDeliveryDate, setEditDeliveryDate] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/orders/orders",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            params: {
              status: statusFilter === "All" ? undefined : statusFilter,
            },
          }
        );
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
      }
    };
    fetchOrders();
  }, [statusFilter]);

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "on the way":
        return "bg-orange-100 text-orange-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "unpaid":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleEditOrder = async () => {
    if (!editDeliveryDate && !editStatus) return;
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updates = {};
      if (editDeliveryDate) updates.deliveryDate = editDeliveryDate;
      if (editStatus) updates.status = editStatus;

      const { data } = await axios.put(
        `http://localhost:5000/api/orders/${selectedOrder.transactionUuid}`,
        updates,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setOrders(
        orders.map((o) =>
          o.transactionUuid === selectedOrder.transactionUuid ? data : o
        )
      );
      setSelectedOrder(data);
      setSuccess("Order updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error.response?.data?.msg || "Failed to update order.");
    } finally {
      setIsSaving(false);
    }
  };

  const openModal = (order) => {
    setSelectedOrder(order);
    const farmerItems = order.items.filter(
      (item) => item.farm_id === localStorage.getItem("userId")
    );
    setEditDeliveryDate(
      farmerItems[0]?.deliveryDate
        ? new Date(farmerItems[0].deliveryDate).toISOString().split("T")[0]
        : ""
    );
    setEditStatus(farmerItems[0]?.status || "Pending");
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6 overflow-y-auto">
        <h1
          className="text-3xl font-bold text-gray-800 mb-6"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Manage Your Orders
        </h1>

        <div className="flex gap-2 mb-6">
          {["All", "Pending", "On the Way", "Delivered", "Unpaid"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  statusFilter === status
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-x-auto">
          <table className="w-full min-w-max">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Order ID",
                  "Customer",
                  "Products",
                  "Order Date",
                  "Delivery Date",
                  "Delivery Location",
                  "Status",
                  "Actions",
                ].map((head) => (
                  <th
                    key={head}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.length > 0 ? (
                orders.map((order) => {
                  const farmerItems = order.items;
                  const firstItem = farmerItems[0];
                  return (
                    <tr
                      key={order.transactionUuid}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">
                        #{order.transactionUuid?.slice(-6) || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {order.consumerName || "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {farmerItems.map((item, i) => (
                          <div key={i}>
                            {item.product?.name || "Unknown"} (
                            {item.quantity || 0} {item.unit})
                          </div>
                        )) || "No items"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {firstItem?.deliveryDate
                          ? new Date(
                              firstItem.deliveryDate
                            ).toLocaleDateString()
                          : "TBD"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {order.deliveryLocation?.address || "Not specified"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${getStatusStyle(
                            firstItem?.status
                          )}`}
                        >
                          {firstItem?.status || "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => openModal(order)}
                          className="p-2 text-green-600 hover:text-green-700"
                          title="View & Edit Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex items-center justify-between px-6 py-3 border-t">
            <div className="flex items-center gap-2">
              <button className="p-1 hover:bg-gray-100 rounded">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="px-3 py-1 bg-green-600 text-white rounded">
                1
              </button>
              <button className="px-3 py-1 hover:bg-gray-100 rounded">2</button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900">
                  Order #{selectedOrder.transactionUuid?.slice(-6) || "N/A"}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {error && (
                  <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
                    <AlertCircle className="w-5 h-5" />
                    <p>{error}</p>
                  </div>
                )}
                {success && (
                  <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                    <p>{success}</p>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">
                    Customer Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">
                        Customer Name
                      </p>
                      <p className="text-gray-900">
                        {selectedOrder.consumerName || "pending"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">
                        Order Date
                      </p>
                      <p className="text-gray-900">
                        {selectedOrder.createdAt
                          ? new Date(
                              selectedOrder.createdAt
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-sm text-gray-600 font-medium">
                        Delivery Location
                      </p>
                      <p className="text-gray-900">
                        {selectedOrder.deliveryLocation?.address ||
                          "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">
                    Order Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600 font-medium">
                        Delivery Date
                      </label>
                      <input
                        type="date"
                        value={editDeliveryDate}
                        onChange={(e) => setEditDeliveryDate(e.target.value)}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 font-medium">
                        Status
                      </label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      >
                        {["Pending", "On the Way", "Delivered", "Unpaid"].map(
                          (s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">
                    Your Products
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {selectedOrder.items
                      .filter(
                        (item) =>
                          item.farm_id === localStorage.getItem("userId")
                      )
                      .map((item, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center py-2 border-b last:border-b-0"
                        >
                          <span className="text-gray-900">
                            {item.product?.name || "Unknown"} (x
                            {item.quantity || 0} {item.unit})
                          </span>
                          <span className="text-gray-700">
                            NPR {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      )) || <p className="text-gray-500">No items</p>}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditOrder}
                  disabled={isSaving || (!editDeliveryDate && !editStatus)}
                  className={`px-4 py-2 flex items-center gap-2 rounded-lg transition-colors ${
                    isSaving
                      ? "bg-green-400 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {isSaving ? (
                    <svg
                      className="animate-spin w-5 h-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                      ></path>
                    </svg>
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Order;

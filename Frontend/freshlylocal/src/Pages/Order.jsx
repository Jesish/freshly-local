// // C:\Users\CHME\Desktop\freshly-local\frontend\src\components\FarmerOrder.jsx
// import React, { useState, useEffect } from "react";
// import {
//   Home,
//   Package,
//   ClipboardList,
//   User,
//   LogOut,
//   Leaf,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const Order = () => {
//   const [orders, setOrders] = useState([]);
//   const [statusFilter, setStatusFilter] = useState("All");
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchOrders();
//   }, [statusFilter]);

//   const fetchOrders = async () => {
//     try {
//       const { data } = await axios.get(
//       "http://localhost:5000/api/orders/orders",
//         {
//           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//           params: { status: statusFilter === "All" ? undefined : statusFilter },
//         }
//       );
//       setOrders(data);
//     } catch (error) {
//       console.error("Error fetching farmer orders:", error);
//       setOrders([]);
//     }
//   };

//   const sidebarItems = [
//     {
//       icon: <Home className="w-5 h-5" />,
//       label: "Dashboard",
//       path: "/farmer/dashboard",
//     },
//     {
//       icon: <Package className="w-5 h-5" />,
//       label: "Manage Products",
//       path: "/farmer/products",
//     },
//     {
//       icon: <ClipboardList className="w-5 h-5" />,
//       label: "Orders",
//       path: "/farmer/orders",
//     },
//     {
//       icon: <User className="w-5 h-5" />,
//       label: "Profile",
//       path: "/farmer/profile",
//     },
//   ];

//   const getStatusStyle = (status) => {
//     switch (status.toLowerCase()) {
//       case "pending":
//         return "bg-yellow-100 text-yellow-800";
//       case "completed":
//         return "bg-blue-100 text-blue-800";
//       case "shipped":
//         return "bg-orange-100 text-orange-800";
//       case "delivered":
//         return "bg-green-100 text-green-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     navigate("/login");
//   };

//   return (
//     <div className="flex h-screen bg-[#E3F6E5]">
//       {/* Sidebar */}
//       <div className="w-64 bg-[#81C784] p-4 flex flex-col">
//         <div className="flex items-center gap-2 mb-8">
//           <Leaf className="w-6 h-6 text-white" />
//           <h1
//             className="text-xl font-semibold text-black"
//             style={{ fontFamily: "Inter, sans-serif" }}
//           >
//             Freshly Local
//           </h1>
//         </div>
//         <nav className="flex-1">
//           {sidebarItems.map((item, index) => (
//             <button
//               key={index}
//               onClick={() => navigate(item.path)}
//               className={`flex items-center gap-3 w-full p-3 rounded-lg mb-2 hover:bg-green-600 transition-colors ${
//                 item.label === "Orders"
//                   ? "bg-[#E3F6E5] text-green-700"
//                   : "text-white"
//               }`}
//             >
//               {item.icon}
//               <span>{item.label}</span>
//             </button>
//           ))}
//         </nav>
//         <button
//           onClick={handleLogout}
//           className="flex items-center gap-3 p-3 text-white hover:bg-green-600 rounded-lg transition-colors"
//         >
//           <LogOut className="w-5 h-5" />
//           <span>Logout</span>
//         </button>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 p-6 bg-gray-50">
//         <h1 className="text-2xl font-semibold mb-6">Manage Your Orders</h1>

//         {/* Status tabs */}
//         <div className="flex gap-2 mb-6">
//           {["All", "Pending", "Shipped", "Delivered"].map((status) => (
//             <button
//               key={status}
//               onClick={() => setStatusFilter(status)}
//               className={`px-4 py-2 rounded-md ${
//                 statusFilter === status
//                   ? "bg-cyan-100 text-cyan-900"
//                   : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//               }`}
//             >
//               {status} Orders
//             </button>
//           ))}
//         </div>

//         {/* Orders table */}
//         <div className="bg-white rounded-lg shadow">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
//                   Order ID
//                 </th>
//                 <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
//                   Customer
//                 </th>
//                 <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
//                   Products
//                 </th>
//                 <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
//                   Order Date
//                 </th>
//                 <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
//                   Delivery Date
//                 </th>
//                 <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {orders.length > 0 ? (
//                 orders.map((order) => (
//                   <tr key={order.transactionUuid} className="hover:bg-gray-50">
//                     <td className="px-6 py-4 text-sm text-gray-900">
//                       #{order.transactionUuid.slice(-6)}
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-900">
//                       {order.consumerName || "Unknown"}
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-900">
//                       {order.items.map((item, index) => (
//                         <div key={index}>
//                           {item.product.name} ({item.quantity} x NPR{" "}
//                           {item.price.toFixed(2)})
//                         </div>
//                       ))}
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-900">
//                       {new Date(order.createdAt).toLocaleDateString()}
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-900">
//                       {order.deliveryDate
//                         ? new Date(order.deliveryDate).toLocaleDateString()
//                         : "TBD"}
//                     </td>
//                     <td className="px-6 py-4 text-sm">
//                       <span
//                         className={`px-3 py-1 rounded-full text-sm ${getStatusStyle(
//                           order.status
//                         )}`}
//                       >
//                         {order.status}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-sm">
//                       <button
//                         onClick={() => alert(JSON.stringify(order, null, 2))}
//                         className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
//                       >
//                         View Details
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td
//                     colSpan="7"
//                     className="px-6 py-4 text-center text-gray-500"
//                   >
//                     No orders found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>

//           {/* Pagination (static for now) */}
//           <div className="flex items-center justify-between px-6 py-3 border-t">
//             <div className="flex items-center gap-2">
//               <button className="p-1 rounded-md hover:bg-gray-100">
//                 <ChevronLeft className="w-5 h-5 text-gray-600" />
//               </button>
//               <button className="px-3 py-1 bg-green-600 text-white rounded-md">
//                 1
//               </button>
//               <button className="px-3 py-1 hover:bg-gray-100 rounded-md">
//                 2
//               </button>
//               <button className="px-3 py-1 hover:bg-gray-100 rounded-md">
//                 3
//               </button>
//               <button className="p-1 rounded-md hover:bg-gray-100">
//                 <ChevronRight className="w-5 h-5 text-gray-600" />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Order;


import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import axios from "axios";
import Sidebar from "./Sidebar";

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);

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
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
      }
    };
    fetchOrders();
  }, [statusFilter]);

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-orange-100 text-orange-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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

        {/* Status Tabs */}
        <div className="flex gap-2 mb-6">
          {["All", "Pending", "Shipped", "Delivered"].map((status) => (
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
          ))}
        </div>

        {/* Orders Table */}
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
                orders.map((order) => (
                  <tr
                    key={order.transactionUuid}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      #{order.transactionUuid.slice(-6)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {order.consumerName || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {order.items.map((item, i) => (
                        <div key={i}>
                          {item.product.name} ({item.quantity} x $
                          {item.price.toFixed(2)})
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {order.deliveryDate
                        ? new Date(order.deliveryDate).toLocaleDateString()
                        : "TBD"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${getStatusStyle(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-green-600 hover:text-green-700"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
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

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  Order #{selectedOrder.transactionUuid.slice(-6)}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="text-gray-800">
                    {selectedOrder.consumerName || "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="text-gray-800">
                    {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Delivery Date</p>
                  <p className="text-gray-800">
                    {selectedOrder.deliveryDate
                      ? new Date(
                          selectedOrder.deliveryDate
                        ).toLocaleDateString()
                      : "TBD"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${getStatusStyle(
                      selectedOrder.status
                    )}`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 mb-2">Products</p>
                  {selectedOrder.items.map((item, i) => (
                    <p key={i} className="text-gray-800">
                      {item.product.name} ({item.quantity} x $
                      {item.price.toFixed(2)})
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Order;

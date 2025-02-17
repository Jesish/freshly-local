import React from "react";
import {
  Home,
  Package,
  ClipboardList,
  User,
  LogOut,
  Leaf,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Order = () => {
  const sidebarItems = [
    {
      icon: <Home className="w-5 h-5" />,
      label: "Dashboard",
      bgColor: "transparent",
      textColor: "text-white",
    },
    {
      icon: <Package className="w-5 h-5" />,
      label: "Manage Products",
      bgColor: "transparent",
      textColor: "text-white",
    },
    {
      icon: <ClipboardList className="w-5 h-5" />,
      label: "Orders",
      bgColor: "#E3F6E5",
      textColor: "text-green-700",
    },
    {
      icon: <User className="w-5 h-5" />,
      label: "Profile",
      bgColor: "transparent",
      textColor: "text-white",
    },
  ];

  const orders = [
    {
      orderId: "#ORD-2025-001",
      customer: "Sarah Johnson",
      products: ["Organic Tomatoes (2kg)", "Fresh Lettuce (1kg)"],
      orderDate: "Jan 15, 2025",
      deliveryDate: "Jan 17, 2025",
      status: "Pending",
    },
    {
      orderId: "#ORD-2025-002",
      customer: "Mike Smith",
      products: ["Organic Apples (5kg)"],
      orderDate: "Jan 15, 2025",
      deliveryDate: "Jan 18, 2025",
      status: "Confirmed",
    },
  ];

  return (
    <div className="flex h-screen bg-[#E3F6E5]">
      {/* Sidebar */}
      <div className="w-64 bg-[#81C784] p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <Leaf className="w-6 h-6 text-white" />
          <h1
            className="text-xl font-semibold text-black"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Freshly Local
          </h1>
        </div>

        <nav className="flex-1">
          {sidebarItems.map((item, index) => (
            <button
              key={index}
              className={`flex items-center gap-3 w-full p-3 rounded-lg mb-2 hover:bg-green-600 transition-colors
                ${
                  item.bgColor === "#E3F6E5"
                    ? "bg-[#E3F6E5] text-green-700"
                    : item.textColor
                }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button className="flex items-center gap-3 p-3 text-white hover:bg-green-600 rounded-lg transition-colors">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-50">
        <h1 className="text-2xl font-semibold mb-6">Manage Your Orders</h1>

        {/* Status tabs */}
        <div className="flex gap-2 mb-6">
          <button className="px-4 py-2 bg-cyan-100 rounded-md text-cyan-900">
            All orders
          </button>
          <button className="px-4 py-2 bg-gray-100 rounded-md text-gray-600">
            Pending
          </button>
          <button className="px-4 py-2 bg-gray-100 rounded-md text-gray-600">
            Shipped
          </button>
          <button className="px-4 py-2 bg-gray-100 rounded-md text-gray-600">
            Delivered
          </button>
        </div>

        {/* Orders table */}
        <div className="bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  Products
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  Order Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  Delivery Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.orderId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {order.orderId}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {order.products.map((product, index) => (
                      <div key={index}>{product}</div>
                    ))}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {order.orderDate}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {order.deliveryDate}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        order.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-3 border-t">
            <div className="flex items-center gap-2">
              <button className="p-1 rounded-md hover:bg-gray-100">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button className="px-3 py-1 bg-green-600 text-white rounded-md">
                1
              </button>
              <button className="px-3 py-1 hover:bg-gray-100 rounded-md">
                2
              </button>
              <button className="px-3 py-1 hover:bg-gray-100 rounded-md">
                3
              </button>
              <button className="p-1 rounded-md hover:bg-gray-100">
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;

import React from "react";
import {
  Home,
  Package,
  DollarSign,
  Clock,
  Box,
  ClipboardList,
  User,
  LogOut,
  Plus,
  List,
  Leaf,
} from "lucide-react";

const ManageProducts = () => {
  const stats = [
    {
      icon: <Package className="w-5 h-5" />,
      value: "24",
      label: "Total Products",
    },
    {
      icon: <ClipboardList className="w-5 h-5" />,
      value: "156",
      label: "Total Orders",
    },
    {
      icon: <DollarSign className="w-5 h-5" />,
      value: "$2,458",
      label: "Monthly Earnings",
    },
    {
      icon: <Clock className="w-5 h-5" />,
      value: "8",
      label: "Pending Orders",
    },
  ];

  const sidebarItems = [
    {
      icon: <Home className="w-5 h-5" />,
      label: "Dashboard",
      bgColor: "transparent",
      textColor: "text-white",
    },
    {
      icon: <Box className="w-5 h-5" />,
      label: "Manage Products",
      bgColor: "#E3F6E5", // Greenish background for "Manage Products"
      textColor: "text-green-700", // Green text color for active state
    },
    {
      icon: <ClipboardList className="w-5 h-5" />,
      label: "Orders",
      bgColor: "transparent",
      textColor: "text-white",
    },
    {
      icon: <User className="w-5 h-5" />,
      label: "Profile",
      bgColor: "transparent",
      textColor: "text-white",
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
      <div className="flex-1 p-8 bg-[#E3F6E5]">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold">Manage Products</h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-500 rounded-lg text-white">
                  {stat.icon}
                </div>
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="flex gap-4">
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" /> Add Product
            </button>
            <button className="flex items-center px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50">
              <List className="w-4 h-4 mr-2" /> View All Orders
            </button>
            <button className="flex items-center px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50">
              <User className="w-4 h-4 mr-2" /> Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageProducts;

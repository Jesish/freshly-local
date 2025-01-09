import React from "react";
import {
  ShoppingBasket,
  Package,
  DollarSign,
  Clock,
  LayoutDashboard,
  Box,
  ClipboardList,
  User,
  LogOut,
} from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      icon: <ShoppingBasket className="w-5 h-5" />,
      value: "24",
      label: "Total Products",
    },
    {
      icon: <Package className="w-5 h-5" />,
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
    { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard" },
    { icon: <Box className="w-5 h-5" />, label: "Manage Products" },
    { icon: <ClipboardList className="w-5 h-5" />, label: "Orders" },
    { icon: <User className="w-5 h-5" />, label: "Profile" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-green-500 p-4 flex flex-col">
        <div className="flex items-center gap-2 text-white mb-8">
          <div className="w-2 h-2 bg-white rounded-full" />
          <h1 className="text-xl font-semibold">Freshly Local</h1>
        </div>

        <nav className="flex-1">
          {sidebarItems.map((item, index) => (
            <button
              key={index}
              className={`flex items-center gap-3 w-full p-3 text-white rounded-lg mb-2 hover:bg-green-600 transition-colors
                ${index === 0 ? "bg-green-600" : ""}`}
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
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold">Welcome, hari ram!</h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="p-6 bg-green-50">
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
            <button className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg">
              <Plus className="w-4 h-4 mr-2" /> Add Product
            </button>
            <button className="border-green-600 text-green-600 hover:bg-green-50 p-3 rounded-lg">
              <List className="w-4 h-4 mr-2" /> View All Orders
            </button>
            <button className="border-green-600 text-green-600 hover:bg-green-50 p-3 rounded-lg">
              <User className="w-4 h-4 mr-2" /> Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

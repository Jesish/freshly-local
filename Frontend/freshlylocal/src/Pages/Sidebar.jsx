// C:\Users\CHME\Desktop\freshly-local\frontend\src\components\Sidebar.jsx
import React, { useState } from "react";
import {
  Home,
  Package,
  ClipboardList,
  User,
  LogOut,
  Leaf,
  Menu,
  X,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarItems = [
    {
      icon: <Home className="w-5 h-5" />,
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: <Package className="w-5 h-5" />,
      label: "Manage Products",
      path: "/Manageproducts",
    },
    {
      icon: <ClipboardList className="w-5 h-5" />,
      label: "Orders",
      path: "/order",
    },
    {
      icon: <ClipboardList className="w-5 h-5" />,
      label: "Messages",
      path: "/messages",
    },
    {
      icon: <User className="w-5 h-5" />,
      label: "Profile",
      path: "/profile",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div
      className={`bg-[#81C784] text-white transition-all duration-300 ${
        isOpen ? "w-64" : "w-16"
      } flex flex-col h-screen`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {isOpen && (
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6" />
            <h1
              className="text-xl font-semibold"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Freshly Local
            </h1>
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 hover:bg-green-700 rounded"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        {sidebarItems.map((item, index) => (
          <button
            key={index}
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-3 w-full p-3 transition-colors ${
              location.pathname === item.path
                ? "bg-[#E3F6E5] text-green-700"
                : "hover:bg-green-700"
            }`}
            title={isOpen ? "" : item.label} // Tooltip when collapsed
          >
            {item.icon}
            {isOpen && (
              <span className="text-sm font-medium">{item.label}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 p-3 hover:bg-green-700 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        {isOpen && <span className="text-sm font-medium">Logout</span>}
      </button>
    </div>
  );
};

export default Sidebar;

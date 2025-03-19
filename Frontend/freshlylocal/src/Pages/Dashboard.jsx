// import React from "react";
// import {
//   Home,
//   Package,
//   DollarSign,
//   Clock,
//   Box,
//   ClipboardList,
//   User,
//   LogOut,
//   Plus,
//   List,
//   Leaf,
// } from "lucide-react";

// const Dashboard = () => {
//   const stats = [
//     {
//       icon: <Package className="w-5 h-5" />,
//       value: "24",
//       label: "Total Products",
//     },
//     {
//       icon: <ClipboardList className="w-5 h-5" />,
//       value: "156",
//       label: "Total Orders",
//     },
//     {
//       icon: <DollarSign className="w-5 h-5" />,
//       value: "$2,458",
//       label: "Monthly Earnings",
//     },
//     {
//       icon: <Clock className="w-5 h-5" />,
//       value: "8",
//       label: "Pending Orders",
//     },
//   ];

//   const sidebarItems = [
//     {
//       icon: <Home className="w-5 h-5" />,
//       label: "Dashboard",
//       bgColor: "#E3F6E5",
//       textColor: "text-green-700",
//     },
//     {
//       icon: <Box className="w-5 h-5" />,
//       label: "Manage Products",
//       bgColor: "transparent",
//       textColor: "text-white",
//     },
//     {
//       icon: <ClipboardList className="w-5 h-5" />,
//       label: "Orders",
//       bgColor: "transparent",
//       textColor: "text-white",
//     },
//     {
//       icon: <User className="w-5 h-5" />,
//       label: "Profile",
//       bgColor: "transparent",
//       textColor: "text-white",
//     },
//   ];

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
//               className={`flex items-center gap-3 w-full p-3 rounded-lg mb-2 hover:bg-green-600 transition-colors
//                 ${
//                   item.bgColor === "#E3F6E5"
//                     ? "bg-[#E3F6E5] text-green-700"
//                     : item.textColor
//                 }`}
//             >
//               {item.icon}
//               <span>{item.label}</span>
//             </button>
//           ))}
//         </nav>

//         <button className="flex items-center gap-3 p-3 text-white hover:bg-green-600 rounded-lg transition-colors">
//           <LogOut className="w-5 h-5" />
//           <span>Logout</span>
//         </button>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 p-8">
//         <div className="mb-8">
//           <h2 className="text-2xl font-semibold">Welcome, hari ram!</h2>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
//           {stats.map((stat, index) => (
//             <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
//               <div className="flex items-center gap-4">
//                 <div className="p-2 bg-green-500 rounded-lg text-white">
//                   {stat.icon}
//                 </div>
//                 <div>
//                   <div className="text-2xl font-bold">{stat.value}</div>
//                   <div className="text-sm text-gray-600">{stat.label}</div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Quick Actions */}
//         <div>
//           <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
//           <div className="flex gap-4">
//             <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
//               <Plus className="w-4 h-4 mr-2" /> Add Product
//             </button>
//             <button className="flex items-center px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50">
//               <List className="w-4 h-4 mr-2" /> View All Orders
//             </button>
//             <button className="flex items-center px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50">
//               <User className="w-4 h-4 mr-2" /> Edit Profile
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

// C:\Users\CHME\Desktop\freshly-local\frontend\src\components\Dashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Package,
  ClipboardList,
  DollarSign,
  Clock,
  Plus,
  List,
  User,
} from "lucide-react";
import axios from "axios";
import Sidebar from "./Sidebar";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    monthlyEarnings: 0,
    pendingOrders: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/users/stats",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats({
          totalProducts: 24,
          totalOrders: 156,
          monthlyEarnings: 2458,
          pendingOrders: 8,
        });
      }
    };
    fetchStats();
  }, []);

  const statItems = [
    {
      icon: <Package className="w-5 h-5" />,
      value: stats.totalProducts,
      label: "Total Products",
    },
    {
      icon: <ClipboardList className="w-5 h-5" />,
      value: stats.totalOrders,
      label: "Total Orders",
    },
    {
      icon: <DollarSign className="w-5 h-5" />,
      value: `$${stats.monthlyEarnings}`,
      label: "Monthly Earnings",
    },
    {
      icon: <Clock className="w-5 h-5" />,
      value: stats.pendingOrders,
      label: "Pending Orders",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <h2
          className="text-3xl font-bold text-gray-800 mb-6"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Welcome, Hari Ram!
        </h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statItems.map((stat, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full text-green-600">
                  {stat.icon}
                </div>
                <div>
                  <div className="text-2xl font-semibold text-gray-800">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h3
            className="text-lg font-semibold text-gray-700 mb-4"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Quick Actions
          </h3>
          <div className="flex gap-4">
            <button className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all">
              <Plus className="w-4 h-4 mr-2" /> Add Product
            </button>
            <button className="flex items-center px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors">
              <List className="w-4 h-4 mr-2" /> View All Orders
            </button>
            <button className="flex items-center px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors">
              <User className="w-4 h-4 mr-2" /> Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

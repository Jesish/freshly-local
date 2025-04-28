import React, { useState, useEffect, Component } from "react";
import {
  Package,
  ClipboardList,
  DollarSign,
  Plus,
  List,
  User,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

// Error Boundary Component
class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-red-700">
          <h2>Something went wrong in the dashboard.</h2>
          <p>Please refresh the page or try again later.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalEarnings: 0, // Initialize to 0
  });
  const [user, setUser] = useState({
    fullName: "Hari Ram",
    farmName: "Hari's Farm",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log("Fetching stats...");
        // Fetch stats
        const { data } = await axios.get(
          "http://localhost:5000/api/users/stats",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log("Stats fetched:", data);
        // Ensure totalEarnings is defined
        setStats({
          totalProducts: data.totalProducts || 0,
          totalOrders: data.totalOrders || 0,
          totalEarnings: data.totalEarnings || 0,
        });

        // Fetch user data
        console.log("Fetching user profile...");
        const userResponse = await axios.get(
          "http://localhost:5000/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log("User profile fetched:", userResponse.data);
        setUser(userResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setError("Failed to load dashboard data. Showing sample data.");
        setStats({
          totalProducts: 24,
          totalOrders: 156,
          totalEarnings: 2458, // Mock data
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
      value: `$${
        stats.totalEarnings ? stats.totalEarnings.toLocaleString() : "0"
      }`, // Fallback to "0"
      label: "Total Earnings",
    },
  ];

  const handleQuickAction = (action) => {
    console.log("Quick action triggered:", action);
    switch (action) {
      case "addProduct":
        navigate("/ManageProducts");
        break;
      case "viewOrders":
        navigate("/order");
        break;
      case "editProfile":
        navigate("/profile");
        break;
      default:
        break;
    }
  };

  if (!localStorage.getItem("token")) {
    console.log("No token found, redirecting to login");
    navigate("/login");
    return null;
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-gradient-to-br from-green-50 to-gray-100">
        <Sidebar />
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2
                className="text-3xl font-bold text-gray-800"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Welcome, {user.fullName}!
              </h2>
              <p className="text-sm text-gray-600">{user.farmName}</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-2 animate-fade-in">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <svg
                className="animate-spin h-8 w-8 text-green-600"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {statItems.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 rounded-full text-green-600">
                        {stat.icon}
                      </div>
                      <div>
                        <div className="text-2xl font-semibold text-gray-800">
                          {stat.value}
                        </div>
                        <div className="text-sm text-gray-600">
                          {stat.label}
                        </div>
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
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => handleQuickAction("addProduct")}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Product
                  </button>
                  <button
                    onClick={() => handleQuickAction("viewOrders")}
                    className="flex items-center px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors duration-300"
                  >
                    <List className="w-4 h-4 mr-2" /> View All Orders
                  </button>
                  <button
                    onClick={() => handleQuickAction("editProfile")}
                    className="flex items-center px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors duration-300"
                  >
                    <User className="w-4 h-4 mr-2" /> Edit Profile
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;

// import React, { useState, useEffect } from "react";
// import {
//   Package,
//   ClipboardList,
//   DollarSign,
//   Clock,
//   Plus,
//   List,
//   User,
//   AlertCircle,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import Sidebar from "./Sidebar";

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const [stats, setStats] = useState({
//     totalProducts: 0,
//     totalOrders: 0,
//     monthlyEarnings: 0,
//     pendingOrders: 0,
//   });
//   const [user, setUser] = useState({ fullName: "Hari Ram", farmName: "Hari's Farm" });
//   const [recentOrders, setRecentOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         // Fetch stats
//         const statsResponse = await axios.get("http://localhost:5000/api/users/stats", {
//           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//         });
//         setStats(statsResponse.data);

//         // Fetch user data
//         const userResponse = await axios.get("http://localhost:5000/api/users/profile", {
//           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//         });
//         setUser(userResponse.data);

//         // Fetch recent orders (mock or real API)
//         const ordersResponse = await axios.get("http://localhost:5000/api/orders/recent", {
//           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//         });
//         setRecentOrders(ordersResponse.data.slice(0, 5)); // Limit to 5 orders
//       } catch (err) {
//         console.error("Error fetching data:", err);
//         setError("Failed to load dashboard data. Showing sample data.");
//         setStats({
//           totalProducts: 24,
//           totalOrders: 156,
//           monthlyEarnings: 2458,
//           pendingOrders: 8,
//         });
//         setRecentOrders([
//           { id: "ORD001", customer: "John Doe", total: 150, status: "Pending", date: "2025-04-27" },
//           { id: "ORD002", customer: "Jane Smith", total: 230, status: "Delivered", date: "2025-04-26" },
//           { id: "ORD003", customer: "Bob Johnson", total: 80, status: "Pending", date: "2025-04-25" },
//         ]);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   const statItems = [
//     {
//       icon: <Package className="w-5 h-5" />,
//       value: stats.totalProducts,
//       label: "Total Products",
//     },
//     {
//       icon: <ClipboardList className="w-5 h-5" />,
//       value: stats.totalOrders,
//       label: "Total Orders",
//     },
//     {
//       icon: <DollarSign className="w-5 h-5" />,
//       value: `$${stats.monthlyEarnings.toLocaleString()}`,
//       label: "Monthly Earnings",
//     },
//     {
//       icon: <Clock className="w-5 h-5" />,
//       value: stats.pendingOrders,
//       label: "Pending Orders",
//     },
//   ];

//   const handleQuickAction = (action) => {
//     switch (action) {
//       case "addProduct":
//         navigate("/ManageProducts");
//         break;
//       case "viewOrders":
//         navigate("/order");
//         break;
//       case "editProfile":
//         navigate("/profile");
//         break;
//       default:
//         break;
//     }
//   };

//   return (
//     <div className="flex h-screen bg-gradient-to-br from-green-50 to-gray-100">
//       <Sidebar />
//       <div className="flex-1 p-6 md:p-8 overflow-y-auto">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-6">
//           <div>
//             <h2
//               className="text-3xl font-bold text-gray-800"
//               style={{ fontFamily: "Inter, sans-serif" }}
//             >
//               Welcome, {user.fullName}!
//             </h2>
//             <p className="text-sm text-gray-600">{user.farmName}</p>
//           </div>
//           <img src="/logo.png" alt="Freshly Local" className="h-10" />
//         </div>

//         {/* Error Message */}
//         {error && (
//           <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-2 animate-fade-in">
//             <AlertCircle size={20} />
//             {error}
//           </div>
//         )}

//         {/* Loading State */}
//         {loading ? (
//           <div className="flex justify-center items-center h-64">
//             <svg
//               className="animate-spin h-8 w-8 text-green-600"
//               viewBox="0 0 24 24"
//             >
//               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//               <path
//                 className="opacity-75"
//                 fill="currentColor"
//                 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//               />
//             </svg>
//           </div>
//         ) : (
//           <>
//             {/* Stats Grid */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//               {statItems.map((stat, index) => (
//                 <div
//                   key={index}
//                   className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1 animate-fade-in"
//                   style={{ animationDelay: `${index * 100}ms` }}
//                 >
//                   <div className="flex items-center gap-4">
//                     <div className="p-3 bg-green-100 rounded-full text-green-600">
//                       {stat.icon}
//                     </div>
//                     <div>
//                       <div className="text-2xl font-semibold text-gray-800">{stat.value}</div>
//                       <div className="text-sm text-gray-600">{stat.label}</div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Quick Actions */}
//             <div className="mb-8">
//               <h3
//                 className="text-lg font-semibold text-gray-700 mb-4"
//                 style={{ fontFamily: "Inter, sans-serif" }}
//               >
//                 Quick Actions
//               </h3>
//               <div className="flex flex-wrap gap-4">
//                 <button
//                   onClick={() => handleQuickAction("addProduct")}
//                   className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300"
//                 >
//                   <Plus className="w-4 h-4 mr-2" /> Add Product
//                 </button>
//                 <button
//                   onClick={() => handleQuickAction("viewOrders")}
//                   className="flex items-center px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors duration-300"
//                 >
//                   <List className="w-4 h-4 mr-2" /> View All Orders
//                 </button>
//                 <button
//                   onClick={() => handleQuickAction("editProfile")}
//                   className="flex items-center px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors duration-300"
//                 >
//                   <User className="w-4 h-4 mr-2" /> Edit Profile
//                 </button>
//               </div>
//             </div>

//             {/* Recent Orders */}
//             <div>
//               <h3
//                 className="text-lg font-semibold text-gray-700 mb-4"
//                 style={{ fontFamily: "Inter, sans-serif" }}
//               >
//                 Recent Orders
//               </h3>
//               <div className="bg-white rounded-xl shadow-md overflow-x-auto">
//                 <table className="w-full text-left">
//                   <thead>
//                     <tr className="bg-green-50">
//                       <th className="p-4 text-sm font-semibold text-gray-700">Order ID</th>
//                       <th className="p-4 text-sm font-semibold text-gray-700">Customer</th>
//                       <th className="p-4 text-sm font-semibold text-gray-700">Total</th>
//                       <th className="p-4 text-sm font-semibold text-gray-700">Status</th>
//                       <th className="p-4 text-sm font-semibold text-gray-700">Date</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {recentOrders.length === 0 ? (
//                       <tr>
//                         <td colSpan="5" className="p-4 text-center text-gray-600">
//                           No recent orders
//                         </td>
//                       </tr>
//                     ) : (
//                       recentOrders.map((order, index) => (
//                         <tr
//                           key={order.id}
//                           className="border-t hover:bg-gray-50 transition-colors"
//                         >
//                           <td className="p-4 text-sm text-gray-800">{order.id}</td>
//                           <td className="p-4 text-sm text-gray-800">{order.customer}</td>
//                           <td className="p-4 text-sm text-gray-800">${order.total}</td>
//                           <td className="p-4 text-sm">
//                             <span
//                               className={`px-2 py-1 rounded-full text-xs ${
//                                 order.status === "Pending"
//                                   ? "bg-yellow-100 text-yellow-700"
//                                   : "bg-green-100 text-green-700"
//                               }`}
//                             >
//                               {order.status}
//                             </span>
//                           </td>
//                           <td className="p-4 text-sm text-gray-800">{order.date}</td>
//                         </tr>
//                       ))
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

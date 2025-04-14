import React, { useEffect, useState } from "react";
import { Search, ShoppingCart, Home, User } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import farmer from "../assets/farmer.png"; // Fallback image
import axios from "axios";
import Navbar from "./Navbar";

const LandingPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token"); // Check if token exists
  const [farms, setFarms] = useState([]);

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/users/farms",
          {
            headers: {
              Authorization: `Bearer ${token}`, // Pass token if needed
            },
          }
        );
        setFarms(response.data);
        console.log("Fetched Farms:", response.data);
      } catch (error) {
        console.error("Error fetching farms:", error);
        // Optional: Set dummy data for testing if API fails
        setFarms([
          // {
          //   _id: "1",
          //   farmName: "Sample Farm",
          //   farmLocation: { placeName: "Sample Location" },
          //   farmImage: "", // No image to test fallback
          // },
        ]);
      }
    };

    fetchFarms();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Navbar />

      {/* Hero Section */}
      <div className="px-6 py-12 grid grid-cols-2 gap-8 max-w-7xl mx-auto">
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-semibold text-gray-900 mb-4">
            Connect with Farmers,
            <br />
            Freshness Guaranteed.
          </h1>
          <p className="text-gray-600 mb-8">
            Explore local farms and shop fresh produce directly from farmers.
          </p>
          <div className="relative">
            <input
              type="text"
              placeholder="Search farm or products..."
              className="w-full px-4 py-3 pl-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>
        <div>
          <img
            src={farmer}
            alt="Happy Farmer"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      </div>

      {/* Discover Farms Section */}
      <div className="px-6 py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">
            Discover Local Farms
          </h2>
          <div className="grid grid-cols-3 gap-6">
            {farms.map((farm) => (
              <div
                key={farm._id}
                className="bg-white rounded-lg overflow-hidden shadow-sm"
              >
                <img
                  src={
                    farm.farmImage
                      ? `http://localhost:5000${farm.farmImage}` // Use farmImage from backend
                      : farmer // Fallback to static image
                  }
                  alt={farm.farmName || "Farm Image"}
                  className="w-full h-48 object-cover"
                  onError={(e) => (e.target.src = farmer)} // Fallback on error
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">
                    {farm.farmName || "Unnamed Farm"}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {farm.farmLocation?.placeName || "Location not specified"}
                  </p>
                  <Link to={`/farmdescription/${farm._id}`}>
                    <button
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      onClick={() => navigate(`/farmdescription/${farm._id}`)}
                    >
                      Shop Now
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-4 border-t">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <a href="#" className="hover:text-gray-900">
              About
            </a>
            <a href="#" className="hover:text-gray-900">
              Contact
            </a>
            <a href="#" className="hover:text-gray-900">
              FAQ
            </a>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <div className="w-5 h-5 bg-gray-600 rounded-full" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <div className="w-5 h-5 bg-gray-600 rounded-full" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

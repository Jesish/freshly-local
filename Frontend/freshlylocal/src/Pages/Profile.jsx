// C:\Users\CHME\Desktop\freshly-local\frontend\src\components\Profile.jsx
import React, { useState, useEffect } from "react";
import { MapPin, Mail, Edit, Tractor } from "lucide-react";
import axios from "axios";
import Sidebar from "./Sidebar";

const Profile = () => {
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    farmName: "",
    farmLocation: "",
    farmdescription: "",
    userType: "farmer",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setProfileData(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setProfileData({
          fullName: "Hari Ram",
          email: "hari@example.com",
          phoneNumber: "123-456-7890",
          farmName: "Hari's Farm",
          farmLocation: "Rural Valley",
          farmdescription: "Organic produce since 2015",
          userType: "farmer",
        });
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-2xl">
                {profileData.fullName ? profileData.fullName[0] : "?"}
              </div>
              <div>
                <h1
                  className="text-2xl font-bold text-gray-800"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {profileData.fullName || "Loading..."}
                </h1>
                <p className="text-gray-600">
                  Growing fresh produce since 2015
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">
                      {profileData.farmLocation || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">
                      {profileData.email || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-md hover:from-green-700 hover:to-green-800 transition-all">
              <Edit className="w-4 h-4" /> Edit Profile
            </button>
          </div>
        </div>

        {/* Personal Details */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-6">
          <h2
            className="text-lg font-semibold text-gray-800 mb-4"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Personal Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Full Name
              </label>
              <div className="p-3 bg-gray-50 rounded-md">
                {profileData.fullName || "N/A"}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Farm Name
              </label>
              <div className="p-3 bg-gray-50 rounded-md">
                {profileData.farmName || "N/A"}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Email Address
              </label>
              <div className="p-3 bg-gray-50 rounded-md">
                {profileData.email || "N/A"}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Contact Number
              </label>
              <div className="p-3 bg-gray-50 rounded-md">
                {profileData.phoneNumber || "N/A"}
              </div>
            </div>
          </div>
        </div>

        {/* Farm Details */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2
            className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            <Tractor className="w-5 h-5 text-gray-700" /> Farm Details
          </h2>
          <div className="mb-6">
            <label className="block text-sm text-gray-600 mb-2">
              Farm Description
            </label>
            <div className="p-3 bg-gray-50 rounded-md">
              {profileData.farmdescription || "N/A"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

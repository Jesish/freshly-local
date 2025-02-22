import React from "react";
import { useState, useEffect } from "react";
import { MapPin, Mail, Edit, Tractor } from "lucide-react";
import axios from "axios";

const Profile = () => {
  const [profileData, setProfileData] = useState({});
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log("Profile Data:", response.data);
        setProfileData(response.data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    fetchProfileData();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Profile Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gray-200 rounded-full" />
            <div>
              <h1 className="text-xl font-semibold">{profileData.fullName}</h1>
              <p className="text-gray-600">
                Growing fresh produce since {profileData.since}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{profileData.location}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{profileData.email}</span>
                </div>
              </div>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Personal Details */}
      <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4">
          <span className="flex items-center gap-2">
            <span className="text-gray-700">Personal Details</span>
          </span>
        </h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Full Name
            </label>
            <div className="p-3 bg-gray-50 rounded-md">
              {profileData.fullName}
            </div>
          </div>
          {/* <div> */}
          {/* <label className="block text-sm text-gray-600 mb-2">
              Farm Name
            </label> */}
          {/* <div className="p-3 bg-gray-50 rounded-md">
              {profileData.farmName}
            </div> */}
          {/* </div> */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Email Address
            </label>
            <div className="p-3 bg-gray-50 rounded-md">{profileData.email}</div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Contact Number
            </label>
            <div className="p-3 bg-gray-50 rounded-md">
              {profileData.phoneNumber}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

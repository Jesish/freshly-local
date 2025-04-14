// FarmerProfile.js
import React, { useState, useEffect, useRef } from "react";
import { MapPin, Mail, Edit, Tractor } from "lucide-react";
import axios from "axios";
import Sidebar from "./Sidebar";

const FarmerProfile = () => {
  const [profileData, setProfileData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [farmImages, setFarmImages] = useState([]);
  const fileInputRef = useRef(null);

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
        setFormData(response.data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    fetchProfileData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "farmLocation") {
      setFormData((prev) => ({
        ...prev,
        farmLocation: { ...prev.farmLocation, placeName: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "profileImage") {
      setProfileImage(files[0]);
    } else if (name === "farmImages") {
      setFarmImages([...files]);
    }
  };

  const handleProfilePicClick = () => {
    if (isEditing) fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("fullName", formData.fullName);
    data.append("email", formData.email);
    data.append("phoneNumber", formData.phoneNumber);
    data.append("farmName", formData.farmName || "");
    data.append("farmDescription", formData.farmdescription || "");
    data.append("farmLocation", JSON.stringify(formData.farmLocation));
    if (profileImage) data.append("profileImage", profileImage);
    farmImages.forEach((file) => data.append("farmImages", file));

    try {
      const response = await axios.put(
        "http://localhost:5000/api/users/updateprofile",
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setProfileData(response.data.user);
      setIsEditing(false);
      setProfileImage(null);
      setFarmImages([]);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                {profileData.profileImage ? (
                  <img
                    src={`http://localhost:5000${profileData.profileImage}`}
                    alt="Profile"
                    className={`w-20 h-20 rounded-full object-cover ${
                      isEditing ? "cursor-pointer opacity-75" : ""
                    }`}
                    onClick={handleProfilePicClick}
                  />
                ) : (
                  <div
                    className={`w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-2xl ${
                      isEditing ? "cursor-pointer" : ""
                    }`}
                    onClick={handleProfilePicClick}
                  >
                    {profileData.fullName ? profileData.fullName[0] : "?"}
                  </div>
                )}
                {isEditing && (
                  <div className="absolute inset-0 flex items-center justify-center text-white bg-black bg-opacity-50 rounded-full">
                    <Edit className="w-4 h-4" />
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  name="profileImage"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>
              <div>
                <h1 className="text-xl font-semibold">
                  {profileData.fullName}
                </h1>
                <p className="text-gray-600">
                  Growing fresh produce since {profileData.since}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">
                      {profileData.farmLocation?.placeName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{profileData.email}</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Edit className="w-4 h-4" />
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4">Personal Details</h2>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName || ""}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber || ""}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-md"
                  />
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Tractor className="w-5 h-5 text-gray-700" /> Farm Details
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Farm Name
                    </label>
                    <input
                      type="text"
                      name="farmName"
                      value={formData.farmName || ""}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Farm Description
                    </label>
                    <input
                      type="text"
                      name="farmDescription"
                      value={formData.farmdescription || ""}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Farm Location
                    </label>
                    <input
                      type="text"
                      name="farmLocation"
                      value={formData.farmLocation?.placeName || ""}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Farm Images
                    </label>
                    <input
                      type="file"
                      name="farmImages"
                      multiple
                      onChange={handleFileChange}
                      className="w-full p-3 border rounded-md"
                      accept="image/*"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Save Changes
              </button>
            </form>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Full Name
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md">
                    {profileData.fullName}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Email Address
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md">
                    {profileData.email}
                  </div>
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

              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Tractor className="w-5 h-5 text-gray-700" /> Farm Details
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Farm Name
                    </label>
                    <div className="p-3 bg-gray-50 rounded-md">
                      {profileData.farmName}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Farm Description
                    </label>
                    <div className="p-3 bg-gray-50 rounded-md">
                      {profileData.farmdescription}
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-sm text-gray-600 mb-2">
                    Farm Images
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {profileData.farmImage &&
                    profileData.farmImage.length > 0 ? (
                      profileData.farmImage.map((img, index) => (
                        <img
                          key={index}
                          src={`http://localhost:5000${img}`}
                          alt={`Farm ${index + 1}`}
                          className="w-full h-64 object-cover rounded-md"
                        />
                      ))
                    ) : (
                      <div className="w-full h-64 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                        No farm images available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmerProfile;

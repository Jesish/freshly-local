import React from "react";
import { MapPin, Mail, Edit, Tractor } from "lucide-react";

const Profile = () => {
  const profileData = {
    name: "John Anderson",
    since: "2015",
    location: "Sacramento, CA",
    email: "john@greenacres.com",
    farmName: "Green Acres Farm",
    phone: "(555) 123-4567",
    description:
      "Green Acres is a family-owned organic farm specializing in sustainable farming practices. We grow a variety of seasonal vegetables and fruits, maintaining the highest standards of organic farming.",
    farmTypes: ["Vegetables", "Fruits", "Organic"],
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Profile Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gray-200 rounded-full" />
            <div>
              <h1 className="text-xl font-semibold">{profileData.name}</h1>
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
            <div className="p-3 bg-gray-50 rounded-md">{profileData.name}</div>
          </div>
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
              Email Address
            </label>
            <div className="p-3 bg-gray-50 rounded-md">{profileData.email}</div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Contact Number
            </label>
            <div className="p-3 bg-gray-50 rounded-md">{profileData.phone}</div>
          </div>
        </div>
      </div>

      {/* Farm Details */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">
          <span className="flex items-center gap-2">
            <Tractor className="w-5 h-5 text-gray-700" />
            <span className="text-gray-700">Farm Details</span>
          </span>
        </h2>
        <div className="mb-6">
          <label className="block text-sm text-gray-600 mb-2">
            Farm Description
          </label>
          <div className="p-3 bg-gray-50 rounded-md">
            {profileData.description}
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-2">Farm Type</label>
          <div className="flex gap-2">
            {profileData.farmTypes.map((type, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

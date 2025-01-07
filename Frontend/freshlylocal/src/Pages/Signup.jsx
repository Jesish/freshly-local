import React, { useState } from "react";
// import { Leaf } from 'lucide-react';

const Signup = () => {
  const [userType, setUserType] = useState("consumer");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    farmName: "",
    farmLocation: "",
    termsAccepted: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-normal mb-6">Create your account</h1>

      {/* User Type Selection */}
      <div className="flex gap-4 mb-8">
        <button
          className={`flex-1 py-3 rounded-lg justify-center items-center
            ${
              userType === "consumer"
                ? "border-2 border-green-500 bg-white text-green-600"
                : "border border-gray-200 bg-white text-gray-600"
            }`}
          onClick={() => setUserType("consumer")}
        >
          <div className="flex items-center justify-center gap-2">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Consumer
          </div>
        </button>
        <button
          className={`flex-1 py-3 rounded-lg justify-center items-center
            ${
              userType === "farmer"
                ? "border-2 border-green-500 bg-white text-green-600"
                : "border border-gray-200 bg-white text-gray-600"
            }`}
          onClick={() => setUserType("farmer")}
        >
          <div className="flex items-center justify-center gap-2">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 9V2L10 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 2L14 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 22H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19 22V13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 22V13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 13L9.65079 9.37C10.8935 8.58 12.4226 8.58 13.6653 9.37L21 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Farmer
          </div>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-base mb-4">Personal Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                className="w-full px-3 py-2 rounded-lg border border-gray-300"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                className="w-full px-3 py-2 rounded-lg border border-gray-300"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                className="w-full px-3 py-2 rounded-lg border border-gray-300"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Password</label>
              <input
                type="password"
                name="password"
                className="w-full px-3 py-2 rounded-lg border border-gray-300"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </div>

        {userType === "farmer" && (
          <div>
            <h2 className="text-base mb-4">Farm Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Farm Name</label>
                <input
                  type="text"
                  name="farmName"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300"
                  value={formData.farmName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Farm Location</label>
                <input
                  type="text"
                  name="farmLocation"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300"
                  value={formData.farmLocation}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="termsAccepted"
            id="terms"
            className="w-4 h-4"
            checked={formData.termsAccepted}
            onChange={handleInputChange}
            required
          />
          <label htmlFor="terms" className="text-sm text-gray-600">
            I agree to the{" "}
            <a href="#" className="text-green-600">
              Terms & Conditions
            </a>{" "}
            and{" "}
            <a href="#" className="text-green-600">
              Privacy Policy
            </a>
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors"
        >
          Create Account
        </button>
      </form>
    </div>
  );
};

export default Signup;

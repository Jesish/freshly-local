import React, { useState, useEffect } from "react";
import API from "../utils/axiosInstance";
import { MapPin } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const Signup = () => {
  const [userType, setUserType] = useState("consumer");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    farmName: "",
    farmLocation: { type: "Point", coordinates: [0, 0], placeName: "" },
    userType: userType,
    termsAccepted: false,
    profileImage: null, // Changed from profilePicture
    farmImage: null,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (showMap && userType === "farmer") {
      let initialLat = 0;
      let initialLng = 0;

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            initialLat = position.coords.latitude;
            initialLng = position.coords.longitude;
            initializeMap(initialLat, initialLng);
          },
          (error) => {
            console.error("Geolocation error:", error);
            initializeMap(initialLat, initialLng);
          }
        );
      } else {
        initializeMap(initialLat, initialLng);
      }
    }
  }, [showMap, userType]);

  const getPlaceNameFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await response.json();
      const placeName = data.display_name || "Location not found";
      setFormData((prev) => ({
        ...prev,
        farmLocation: { ...prev.farmLocation, placeName },
      }));
    } catch (err) {
      console.error("Nominatim geocoding failed:", err);
      setFormData((prev) => ({
        ...prev,
        farmLocation: {
          ...prev.farmLocation,
          placeName: "Failed to fetch location",
        },
      }));
    }
  };

  const initializeMap = (lat, lng) => {
    const map = L.map("map").setView(
      [lat, lng],
      lat === 0 && lng === 0 ? 2 : 15
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const marker = L.marker([lat, lng], { draggable: true }).addTo(map);

    getPlaceNameFromCoords(lat, lng);

    marker.on("dragend", () => {
      const position = marker.getLatLng();
      const newCoords = [position.lng, position.lat];
      setFormData((prev) => ({
        ...prev,
        farmLocation: { ...prev.farmLocation, coordinates: newCoords },
      }));
      getPlaceNameFromCoords(position.lat, position.lng);
    });

    const searchInput = document.getElementById("location-search");
    searchInput.addEventListener("keypress", async (e) => {
      if (e.key === "Enter") {
        const query = searchInput.value;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`
          );
          const data = await response.json();
          if (data.length > 0) {
            const newLat = parseFloat(data[0].lat);
            const newLng = parseFloat(data[0].lon);
            map.setView([newLat, newLng], 15);
            marker.setLatLng([newLat, newLng]);
            const newCoords = [newLng, newLat];
            setFormData((prev) => ({
              ...prev,
              farmLocation: {
                ...prev.farmLocation,
                coordinates: newCoords,
                placeName: data[0].display_name || "Location not found",
              },
            }));
          }
        } catch (err) {
          console.error("Nominatim search failed:", err);
        }
      }
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files[0],
    }));
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
    setFormData((prev) => ({
      ...prev,
      userType: type,
      farmImage: type === "consumer" ? null : prev.farmImage,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (userType === "farmer" && !formData.farmImage) {
      setError("Farm image is required for farmers.");
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append("fullName", formData.fullName);
      data.append("email", formData.email);
      data.append("phoneNumber", formData.phoneNumber);
      data.append("password", formData.password);
      data.append("userType", formData.userType);
      data.append("farmLocation", JSON.stringify(formData.farmLocation));
      if (formData.farmName) data.append("farmName", formData.farmName);
      if (formData.profileImage)
        data.append("profileImage", formData.profileImage); // Changed from profilePicture
      if (formData.farmImage) data.append("farmImage", formData.farmImage);

      console.log("Form Data:", Object.fromEntries(data)); // Debug
      const response = await API.post("/users/signup", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        console.log("Account created successfully:", response.data);
      }
    } catch (err) {
      setError(err.response ? err.response.data.msg : "Server error");
    } finally {
      setLoading(false);
    }
  };

  const toggleMap = () => {
    setShowMap(!showMap);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-normal mb-6">Create your account</h1>

      <div className="flex gap-4 mb-8">
        <button
          className={`flex-1 py-3 rounded-lg justify-center items-center ${
            userType === "consumer"
              ? "border-2 border-green-500 bg-white text-green-600"
              : "border border-gray-200 bg-white text-gray-600"
          }`}
          onClick={() => handleUserTypeChange("consumer")}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
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
          className={`flex-1 py-3 rounded-lg justify-center items-center ${
            userType === "farmer"
              ? "border-2 border-green-500 bg-white text-green-600"
              : "border border-gray-200 bg-white text-gray-600"
          }`}
          onClick={() => handleUserTypeChange("farmer")}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
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
            <div>
              <label className="block text-sm mb-1">
                Profile Image (Optional)
              </label>{" "}
              {/* Updated label */}
              <input
                type="file"
                name="profileImage" // Changed from profilePicture
                className="w-full px-3 py-2 rounded-lg border border-gray-300"
                onChange={handleFileChange}
                accept="image/*"
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
                <div className="relative">
                  <input
                    id="location-search"
                    type="text"
                    placeholder="Search or click to set location"
                    className="w-full px-3 py-2 pl-10 rounded-lg border border-gray-300"
                    value={formData.farmLocation.placeName}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        farmLocation: {
                          ...prev.farmLocation,
                          placeName: e.target.value,
                        },
                      }));
                    }}
                  />
                  <button
                    type="button"
                    onClick={toggleMap}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-green-600"
                  >
                    <MapPin size={20} />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Coordinates: {formData.farmLocation.coordinates.join(", ")}
                </p>
              </div>
              <div>
                <label className="block text-sm mb-1">
                  Farm Image (Required)
                </label>
                <input
                  type="file"
                  name="farmImage"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300"
                  onChange={handleFileChange}
                  accept="image/*"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {showMap && userType === "farmer" && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg w-full max-w-2xl">
              <h3 className="text-lg font-semibold mb-2">Set Farm Location</h3>
              <div id="map" className="w-full h-96 rounded-lg border"></div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={toggleMap}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Save Location
                </button>
                <button
                  onClick={toggleMap}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
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
        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors"
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>
    </div>
  );
};

export default Signup;

import React, { useState, useEffect } from "react";
import API from "../utils/axiosInstance";
import { MapPin, User, Leaf, FileText, X } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
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
    profileImage: null,
    farmImage: null,
    verificationDocuments: [],
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (showMap && userType === "farmer") {
      let initialLat = 27.7,
        initialLng = 85.3;
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
      setFormData((prev) => ({
        ...prev,
        farmLocation: {
          ...prev.farmLocation,
          placeName: data.display_name || "Location not found",
        },
      }));
    } catch (err) {
      console.error("Nominatim geocoding failed:", err);
    }
  };

  const initializeMap = (lat, lng) => {
    const map = L.map("map").setView(
      [lat, lng],
      lat === 27.7 && lng === 85.3 ? 13 : 15
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
    getPlaceNameFromCoords(lat, lng);

    marker.on("dragend", () => {
      const position = marker.getLatLng();
      setFormData((prev) => ({
        ...prev,
        farmLocation: {
          ...prev.farmLocation,
          coordinates: [position.lng, position.lat],
        },
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
            setFormData((prev) => ({
              ...prev,
              farmLocation: {
                ...prev.farmLocation,
                coordinates: [newLng, newLat],
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
    if (name === "verificationDocuments") {
      setFormData((prev) => ({
        ...prev,
        verificationDocuments: Array.from(files),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    }
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
    setFormData((prev) => ({
      ...prev,
      userType: type,
      farmName: type === "consumer" ? "" : prev.farmName,
      farmImage: type === "consumer" ? null : prev.farmImage,
      verificationDocuments:
        type === "consumer" ? [] : prev.verificationDocuments,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (userType === "farmer") {
      if (!formData.farmImage) {
        setError("Farm image is required for farmers.");
        setLoading(false);
        return;
      }
      if (formData.verificationDocuments.length === 0) {
        setError("At least one verification document is required for farmers.");
        setLoading(false);
        return;
      }
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
        data.append("profileImage", formData.profileImage);
      if (formData.farmImage) data.append("farmImage", formData.farmImage);
      formData.verificationDocuments.forEach((doc) =>
        data.append("verificationDocuments", doc)
      );

      const response = await API.post("/users/signup", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 201) {
        if (userType === "farmer") {
          setShowPopup(true);
          setTimeout(() => {
            setShowPopup(false);
            navigate("/login");
          }, 3000);
        } else {
          navigate("/login");
        }
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMap = () => setShowMap(!showMap);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-gray-100">
      <div className="max-w-2xl w-full mx-4 p-8 bg-white rounded-2xl shadow-xl">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Freshly Local" className="h-12" />
          <span className="text-2xl font-bold text-green-600 ml-2">
            Freshly Local
          </span>
        </div>

        <h2 className="text-3xl font-semibold text-gray-800 text-center mb-6">
          Create Your Account
        </h2>

        <div className="flex gap-4 mb-8">
          <button
            className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 ${
              userType === "consumer"
                ? "bg-green-100 border-2 border-green-500 text-green-600"
                : "bg-gray-100 text-gray-600"
            }`}
            onClick={() => handleUserTypeChange("consumer")}
          >
            <User size={20} /> Consumer
          </button>
          <button
            className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 ${
              userType === "farmer"
                ? "bg-green-100 border-2 border-green-500 text-green-600"
                : "bg-gray-100 text-gray-600"
            }`}
            onClick={() => handleUserTypeChange("farmer")}
          >
            <Leaf size={20} /> Farmer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Image (Optional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="profileImage"
                    name="profileImage"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                  <label
                    htmlFor="profileImage"
                    className="w-full px-3 py-2 bg-green-100 text-green-600 rounded-lg border border-green-300 hover:bg-green-200 cursor-pointer text-center"
                  >
                    Upload Profile Image
                  </label>
                  {formData.profileImage && (
                    <p className="text-sm text-gray-600 mt-1">
                      {formData.profileImage.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {userType === "farmer" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Farm Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Farm Name
                  </label>
                  <input
                    type="text"
                    name="farmName"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                    value={formData.farmName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Farm Location
                  </label>
                  <div className="relative">
                    <input
                      id="location-search"
                      type="text"
                      className="w-full px-3 py-2 pl-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                      value={formData.farmLocation.placeName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          farmLocation: {
                            ...prev.farmLocation,
                            placeName: e.target.value,
                          },
                        }))
                      }
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Farm Image (Required)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="farmImage"
                      name="farmImage"
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*"
                      required
                    />
                    <label
                      htmlFor="farmImage"
                      className="w-full px-3 py-2 bg-green-100 text-green-600 rounded-lg border border-green-300 hover:bg-green-200 cursor-pointer text-center"
                    >
                      Upload Farm Image
                    </label>
                    {formData.farmImage && (
                      <p className="text-sm text-gray-600 mt-1">
                        {formData.farmImage.name}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Documents (Required)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="verificationDocuments"
                      name="verificationDocuments"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,image/*"
                      multiple
                      required
                    />
                    <label
                      htmlFor="verificationDocuments"
                      className="w-full px-3 py-2 bg-green-100 text-green-600 rounded-lg border border-green-300 hover:bg-green-200 cursor-pointer text-center"
                    >
                      Upload Verification Documents
                    </label>
                    {formData.verificationDocuments.length > 0 && (
                      <ul className="text-sm text-gray-600 mt-2">
                        {formData.verificationDocuments.map((doc, index) => (
                          <li key={index}>{doc.name}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {showMap && userType === "farmer" && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded-2xl w-full max-w-2xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Set Farm Location
                </h3>
                <input
                  id="location-search"
                  type="text"
                  className="w-full px-3 py-2 mb-4 rounded-lg border border-gray-300"
                />
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
              className="w-4 h-4 text-green-600"
              checked={formData.termsAccepted}
              onChange={handleInputChange}
              required
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I agree to the{" "}
              <a href="#" className="text-green-600 hover:underline">
                Terms & Conditions
              </a>{" "}
              and{" "}
              <a href="#" className="text-green-600 hover:underline">
                Privacy Policy
              </a>
            </label>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
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
                Creating Account...
              </div>
            ) : (
              "Create Account"
            )}
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-green-600 hover:underline font-medium"
            >
              Sign In
            </a>
          </p>
        </form>

        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full relative animate-fade-in">
              <button
                onClick={() => {
                  setShowPopup(false);
                  navigate("/login");
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Account Created
              </h3>
              <p className="text-gray-600">
                Try after 30 minutes, admin is reviewing your report.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;

import React, { useState, useEffect } from "react";
import API from "../utils/axiosInstance";
import { MapPin } from "lucide-react";

const Signup = () => {
  const [userType, setUserType] = useState("consumer");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    farmName: "",
    farmLocation: { type: "Point", coordinates: [0, 0], placeName: "" }, // Added placeName
    userType: userType,
    termsAccepted: false,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDSaH5APCpRVR7bKzv_q4wVyQy7KQ8F-Jw&libraries=places`;
    script.async = true;
    script.onload = () => setMapLoaded(true);
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  // Initialize map with current location when shown
  useEffect(() => {
    if (mapLoaded && showMap && userType === "farmer") {
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
            initializeMap(initialLat, initialLng); // Fallback to (0, 0)
          }
        );
      } else {
        initializeMap(initialLat, initialLng); // Fallback if geolocation not supported
      }
    }
  }, [mapLoaded, showMap, userType]);

  const getPlaceNameFromCoords = (lat, lng) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        const placeName = results[0].formatted_address;
        setFormData((prev) => ({
          ...prev,
          farmLocation: {
            ...prev.farmLocation,
            placeName: placeName,
          },
        }));
        console.log("Place Name:", placeName); // Print place name
      } else {
        console.error("Geocoding failed:", status);
        setFormData((prev) => ({
          ...prev,
          farmLocation: {
            ...prev.farmLocation,
            placeName: "Unknown location",
          },
        }));
      }
    });
  };

  const initializeMap = (lat, lng) => {
    const map = new window.google.maps.Map(document.getElementById("map"), {
      center: { lat, lng },
      zoom: lat === 0 && lng === 0 ? 2 : 15,
    });
    const marker = new window.google.maps.Marker({
      position: { lat, lng },
      map: map,
      draggable: true,
    });

    // Initial geocoding for current location
    getPlaceNameFromCoords(lat, lng);

    // Update coordinates and place name when marker is dragged
    window.google.maps.event.addListener(marker, "dragend", () => {
      const position = marker.getPosition();
      const newLat = position.lat();
      const newLng = position.lng();
      const newCoords = [newLng, newLat];
      setFormData((prev) => ({
        ...prev,
        farmLocation: { ...prev.farmLocation, coordinates: newCoords },
      }));
      console.log("Selected Coordinates:", newCoords);
      getPlaceNameFromCoords(newLat, newLng); // Fetch place name
    });

    // Places API for search
    const input = document.getElementById("location-search");
    const autocomplete = new window.google.maps.places.Autocomplete(input);
    autocomplete.bindTo("bounds", map);
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const newLat = place.geometry.location.lat();
        const newLng = place.geometry.location.lng();
        marker.setPosition({ lat: newLat, lng: newLng });
        map.setCenter({ lat: newLat, lng: newLng });
        map.setZoom(15);
        const newCoords = [newLng, newLat];
        setFormData((prev) => ({
          ...prev,
          farmLocation: {
            ...prev.farmLocation,
            coordinates: newCoords,
            placeName: place.formatted_address || "Unknown location",
          },
        }));
        console.log("Selected Coordinates:", newCoords);
        console.log("Place Name:", place.formatted_address);
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

  const handleUserTypeChange = (type) => {
    setUserType(type);
    setFormData((prev) => ({
      ...prev,
      userType: type,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("Form Data:", formData);
      const response = await API.post("/users/signup", formData);
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

      {/* User Type Selection */}
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
                    value={formData.farmLocation.placeName} // Display place name
                    onChange={(e) => e.target.value} // Keep input active for search
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
            </div>
          </div>
        )}

        {/* Map Popup */}
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

import React, { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

const DirectionsMap = ({ destination, onClose }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation([
            position.coords.latitude,
            position.coords.longitude,
          ]);
        },
        (err) => {
          setError(
            "Unable to get your location. Please allow location access."
          );
          console.error("Geolocation error:", err);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  }, []);

  useEffect(() => {
    if (currentLocation && destination?.coordinates && !mapRef.current) {
      const [destLng, destLat] = destination.coordinates;

      const map = L.map("directions-map", {
        zoomControl: true,
        scrollWheelZoom: false,
      }).setView([currentLocation[0], currentLocation[1]], 7);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      L.marker([currentLocation[0], currentLocation[1]], {
        icon: L.icon({
          iconUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        }),
      })
        .addTo(map)
        .bindPopup("Your Location")
        .openPopup();

      L.marker([destLat, destLng], {
        icon: L.icon({
          iconUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        }),
      })
        .addTo(map)
        .bindPopup(destination.placeName || "Farm");

      const fetchDirections = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
            "http://localhost:5000/api/directions",
            {
              params: {
                start: `${currentLocation[1]},${currentLocation[0]}`,
                end: `${destLng},${destLat}`,
              },
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          console.log("ORS Response:", response.data);
          const coordinates = response.data.features[0].geometry.coordinates;
          const route = coordinates.map(([lng, lat]) => [lat, lng]);
          L.polyline(route, { color: "blue" }).addTo(map);
          map.fitBounds(route);
        } catch (err) {
          const errorMsg =
            err.response?.data?.error || "Failed to load directions";
          setError(errorMsg);
          console.error("Directions error:", err.response?.data || err.message);
          // Mock route as fallback
          const mockRoute = [
            [currentLocation[0], currentLocation[1]],
            [destLat, destLng],
          ];
          L.polyline(mockRoute, { color: "blue", dashArray: "5, 10" }).addTo(
            map
          ); // Dashed line for mock
          map.fitBounds(mockRoute);
        }
      };

      fetchDirections();

      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [currentLocation, destination]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg w-full max-w-3xl">
        <h3 className="text-lg font-semibold mb-2">
          Directions to {destination?.placeName || "Farm"}
        </h3>
        {error && (
          <p className="text-red-500 mb-2">
            {typeof error === "string" ? error : "An error occurred"}
          </p>
        )}
        <div
          id="directions-map"
          className="w-full h-96 rounded-lg border"
        ></div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DirectionsMap;

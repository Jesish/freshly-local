import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { ShoppingBag, ArrowLeft, MapPin } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const PaymentPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [consumer, setConsumer] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [isSingleItem, setIsSingleItem] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (state?.singleItem) {
        // Single-item payment
        setIsSingleItem(true);
        setCartItems([state.singleItem]);
        setTotalAmount(state.singleItem.price * state.singleItem.quantity);
        setConsumer(state.userId || localStorage.getItem("userId") || "");
      } else {
        // Cart-based payment
        try {
          const { data } = await axios.get(
            "http://localhost:5000/api/getcart",
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          setCartItems(data.items || []);
          setConsumer(data.consumer || "");
        } catch (error) {
          console.error("Error fetching cart:", error);
          setCartItems([]);
          setMessage("Error loading cart");
        }
      }
    };
    fetchData();
  }, [state]);

  useEffect(() => {
    if (!isSingleItem) {
      const total = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      setTotalAmount(total);
    }
  }, [cartItems, isSingleItem]);

  useEffect(() => {
    if (showMap) {
      let initialLat = 27.7; // Default to Kathmandu
      let initialLng = 85.3;

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
  }, [showMap]);

  const getPlaceNameFromCoords = async (lat, lng) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      return response.data.display_name || "Unknown address";
    } catch (error) {
      console.error("Error geocoding coordinates:", error);
      return "Unknown address";
    }
  };

  const initializeMap = (lat, lng) => {
    const map = L.map("map").setView(
      [lat, lng],
      lat === 27.7 && lng === 85.3 ? 13 : 15
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const marker = L.marker([lat, lng], { draggable: true }).addTo(map);

    getPlaceNameFromCoords(lat, lng).then((address) => {
      setDeliveryLocation({ lat, lng, address });
    });

    marker.on("dragend", () => {
      const position = marker.getLatLng();
      getPlaceNameFromCoords(position.lat, position.lng).then((address) => {
        setDeliveryLocation({ lat: position.lat, lng: position.lng, address });
      });
    });

    const searchInput = document.getElementById("location-search");
    searchInput.addEventListener("keypress", async (e) => {
      if (e.key === "Enter") {
        const query = searchInput.value;
        try {
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`
          );
          const data = response.data;
          if (data.length > 0) {
            const newLat = parseFloat(data[0].lat);
            const newLng = parseFloat(data[0].lon);
            map.setView([newLat, newLng], 15);
            marker.setLatLng([newLat, newLng]);
            const address = data[0].display_name || "Unknown address";
            setDeliveryLocation({ lat: newLat, lng: newLng, address });
          }
        } catch (error) {
          console.error("Nominatim search failed:", error);
        }
      }
    });
  };

  const handlePayment = async () => {
    try {
      if (!deliveryLocation || !deliveryLocation.address) {
        setMessage("Please select a delivery location or enter an address.");
        return;
      }

      let response;
      if (isSingleItem) {
        // Single-item payment
        const item = cartItems[0]; // Single item
        response = await axios.post(
          "http://localhost:5000/api/payment/single-payment", // Match ProductPage.jsx
          {
            productId: item.product._id,
            quantity: item.quantity,
            deliveryLocation,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      } else {
        // Cart-based payment
        response = await axios.post(
          "http://localhost:5000/api/payment/initiate-payment",
          {
            cart: cartItems,
            userId: consumer,
            totalAmount,
            deliveryLocation,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }

      const paymentData = response.data;

      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

      Object.keys(paymentData).forEach((key) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = paymentData[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      setMessage(
        "Error initiating payment: " +
          (error.response?.data?.msg || error.message)
      );
    }
  };

  const toggleMap = () => {
    setShowMap(!showMap);
  };

  const handleFallbackLocationChange = (e) => {
    setDeliveryLocation({ address: e.target.value });
  };

  if (!cartItems.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-lg">No items to purchase.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-green-600 to-green-800 text-white flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingBag size={28} /> Confirm Your Order
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 hover:bg-green-900 p-2 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} /> Back
          </button>
        </div>

        <div className="p-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            Order Details
          </h3>
          <div className="space-y-6">
            <p className="text-gray-700 text-lg">
              <span className="font-medium">Total Items:</span>{" "}
              {cartItems.length}
            </p>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-4 font-semibold text-gray-700">Product</th>
                    <th className="p-4 font-semibold text-gray-700">
                      Quantity
                    </th>
                    <th className="p-4 font-semibold text-gray-700 text-right">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.product._id} className="border-t">
                      <td className="p-4 text-gray-800">{item.product.name}</td>
                      <td className="p-4 text-gray-800">{item.quantity}</td>
                      <td className="p-4 text-right text-gray-800">
                        NPR {(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between text-lg font-semibold text-gray-800 mt-6">
              <span>Total Amount:</span>
              <span>NPR {totalAmount.toFixed(2)}</span>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Delivery Location *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={deliveryLocation?.address || ""}
                  onChange={handleFallbackLocationChange}
                  placeholder="Enter or select delivery address"
                  className="w-full px-3 py-2 pl-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <button
                  type="button"
                  onClick={toggleMap}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-green-600"
                >
                  <MapPin size={20} />
                </button>
              </div>
              {deliveryLocation && deliveryLocation.lat && (
                <p className="text-sm text-gray-500 mt-1">
                  Coordinates: {deliveryLocation.lat}, {deliveryLocation.lng}
                </p>
              )}
            </div>
          </div>

          {showMap && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded-lg w-full max-w-2xl">
                <h3 className="text-lg font-semibold mb-2">
                  Set Delivery Location
                </h3>
                <input
                  id="location-search"
                  type="text"
                  placeholder="Search for a location"
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

          <button
            onClick={handlePayment}
            className="w-full mt-8 bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 transition-all duration-200 shadow-lg text-lg font-semibold flex items-center justify-center gap-2"
          >
            <ShoppingBag size={20} /> Confirm and Pay with eSewa
          </button>
          {message && (
            <p className="mt-4 text-center text-red-500">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;

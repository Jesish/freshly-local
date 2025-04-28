import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom"; // Added useNavigate
import { ShoppingCart, DollarSign, AlertTriangle } from "lucide-react";
import Navbar from "./Navbar";
import Toast from "./Toast";

const categories = [
  "All",
  "Vegetables",
  "Fruits",
  "Dairy & Eggs",
  "Fresh Herbs",
  "Grains",
  "Bakery",
  "Meat & Poultry",
  "Seafood",
  "Beverages",
];

const AlertModal = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-md p-6 max-w-md w-full animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-800">Stock Alert</h3>
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // Added for navigation
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [fetchCartCount, setFetchCartCount] = useState(null);
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: "" });

  const BACKEND_URL = "http://localhost:5000";

  useEffect(() => {
    if (!id) return;

    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/products/farmer/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log("Fetched products:", response.data);
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setToastMessage("Failed to load products.");
        setToastVisible(true);
      }
    };

    fetchProducts();
  }, [id]);

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = async (productId, farmId) => {
    try {
      await axios.post(
        `${BACKEND_URL}/api/cart`,
        { productId, quantity: 1, farm_id: farmId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      setToastMessage("Product added to cart successfully!");
      setToastVisible(true);
      if (fetchCartCount) {
        await fetchCartCount();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.msg || "Failed to add to cart.";
      setAlertModal({ isOpen: true, message: errorMsg });
    }
  };

  const handleBuyNow = (product) => {
    const singleItem = {
      product: {
        _id: product._id,
        name: product.name,
        price: product.price,
      },
      quantity: 1,
      price: product.price,
      farm_id: id, // Farmer ID from useParams
      unit: product.unit || "kg",
    };
    navigate("/payment", {
      state: {
        singleItem,
        userId: localStorage.getItem("userId") || "",
      },
    });
  };

  const handleCartUpdate = useCallback((fetchFn) => {
    setFetchCartCount(() => fetchFn);
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-64 bg-green-100 p-6 shadow-md">
        <h2 className="text-2xl font-bold text-green-800 mb-6">Categories</h2>
        <ul>
          {categories.map((category) => (
            <li
              key={category}
              className={`cursor-pointer p-3 rounded-lg mb-2 hover:bg-green-200 transition-colors ${
                selectedCategory === category ? "bg-green-200" : ""
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1 p-8">
        <Navbar onCartUpdate={handleCartUpdate} />
        <div className="mt-20">
          <div className="mb-8">
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-4 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-lg"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow animate-fade-in relative"
                >
                  {product.stock === 0 && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      Out of Stock
                    </div>
                  )}
                  <img
                    src={
                      product.image
                        ? `${BACKEND_URL}${product.image}`
                        : "https://via.placeholder.com/200?text=No+Image"
                    }
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                    onError={(e) => {
                      console.error(
                        `Failed to load image: ${BACKEND_URL}${product.image}`
                      );
                      e.target.src =
                        "https://via.placeholder.com/200?text=No+Image";
                    }}
                  />
                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      NPR {product.price.toFixed(2)}/{product.unit}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      Stock: {product.stock} {product.unit}
                    </p>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleAddToCart(product._id, id)}
                        disabled={product.stock === 0}
                        className={`flex-1 p-3 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors ${
                          product.stock === 0
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                      >
                        <ShoppingCart size={16} />
                        Add to Cart
                      </button>
                      <button
                        onClick={() => handleBuyNow(product)}
                        disabled={product.stock === 0}
                        className={`flex-1 p-3 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors ${
                          product.stock === 0
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center col-span-full text-lg animate-fade-in">
                No products available in this category.
              </p>
            )}
          </div>
        </div>
        <Toast
          message={toastMessage}
          isVisible={toastVisible}
          setIsVisible={setToastVisible}
        />
        <AlertModal
          isOpen={alertModal.isOpen}
          message={alertModal.message}
          onClose={() => setAlertModal({ isOpen: false, message: "" })}
        />
      </div>
    </div>
  );
};

export default ProductPage;

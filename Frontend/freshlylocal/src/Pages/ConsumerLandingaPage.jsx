import React, { useState, useEffect, useCallback } from "react";
import { Search, ShoppingCart, Filter, X, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import farmer from "../assets/farmer.png";
import axios from "axios";
import Navbar from "./Navbar";
import debounce from "lodash.debounce";

const Toast = ({ message, isVisible, setIsVisible }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setIsVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, setIsVisible]);

  if (!isVisible) return null;
  return (
    <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
      {message}
    </div>
  );
};

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

const LandingPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [farms, setFarms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    category: "",
    farmer: "",
  });
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: "" });
  const [fetchCartCount, setFetchCartCount] = useState(null);

  const BACKEND_URL = "http://localhost:5000";

  useEffect(() => {
    const fetchFarms = async () => {
      if (!token) {
        setFarms([]);
        return;
      }
      try {
        const response = await axios.get(`${BACKEND_URL}/api/users/farms`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("LandingPage: Fetched farms:", response.data);
        setFarms(response.data);
      } catch (error) {
        console.error("LandingPage: Error fetching farms:", error);
        setFarms([]);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/products/categories`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCategories(response.data);
      } catch (error) {
        console.error("LandingPage: Error fetching categories:", error);
      }
    };

    fetchFarms();
    fetchCategories();
  }, [token]);

  const handleCartUpdate = useCallback((fetchFn) => {
    setFetchCartCount(() => fetchFn);
  }, []);

  const fetchProducts = useCallback(
    debounce(async (query, filters, sort, page, reset = false) => {
      if (!query) {
        setProducts([]);
        setHasMore(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const params = { name: query, ...filters, sort, page, limit: 20 };
        const { data } = await axios.get(`${BACKEND_URL}/api/products/search`, {
          params,
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("LandingPage: Fetched products:", data);
        setProducts((prev) => (reset ? data : [...prev, ...data]));
        setHasMore(data.length === 20);
      } catch (error) {
        setError("Failed to fetch products. Please try again.");
        console.error("LandingPage: Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    [token]
  );

  const fetchSuggestions = useCallback(
    debounce(async (query) => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const { data } = await axios.get(`${BACKEND_URL}/api/products/search`, {
          params: { name: query, autocomplete: true },
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuggestions(data);
      } catch (error) {
        console.error("LandingPage: Error fetching suggestions:", error);
        setSuggestions([]);
      }
    }, 300),
    [token]
  );

  useEffect(() => {
    if (!token) {
      setProducts([]);
      setSuggestions([]);
      setFarms([]);
      return;
    }
    setPage(1);
    fetchProducts(searchQuery, filters, sort, 1, true);
    fetchSuggestions(searchQuery);
  }, [searchQuery, filters, sort, fetchProducts, fetchSuggestions, token]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(searchQuery, filters, sort, nextPage);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ minPrice: "", maxPrice: "", category: "", farmer: "" });
  };

  const handleAddToCart = async (productId, farmerId) => {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      console.log("LandingPage: Adding to cart:", { productId, farmerId });
      await axios.post(
        `${BACKEND_URL}/api/cart`,
        { productId, quantity: 1, farm_id: farmerId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
      console.error("LandingPage: Add to cart error:", errorMsg);
      setAlertModal({ isOpen: true, message: errorMsg });
    }
  };

  const handleShopNow = (farmId) => {
    if (!token) {
      navigate("/login");
    } else {
      navigate(`/farmdescription/${farmId}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar onCartUpdate={handleCartUpdate} />
      <div className="px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-semibold text-gray-900 mb-4">
            Connect with Farmers,
            <br />
            Freshness Guaranteed.
          </h1>
          <p className="text-gray-600 mb-8">
            Explore local farms and shop fresh produce directly from farmers.
          </p>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products (e.g., Apple, Carrot)..."
              aria-label="Search products"
              className="w-full px-4 py-3 pl-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            {suggestions.length > 0 && (
              <ul className="absolute w-full bg-white border rounded-md shadow-sm mt-1 z-10 max-h-60 overflow-y-auto">
                {suggestions.map((s) => (
                  <li
                    key={s._id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSearchQuery(s.name);
                      setSuggestions([]);
                    }}
                  >
                    {s.name} ({s.farmName})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div>
          <img
            src={farmer}
            alt="Happy Farmer"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      </div>

      {token && searchQuery ? (
        <div className="px-6 py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                Explore Products
              </h2>
              <div className="flex items-center gap-4">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="p-2 border rounded-md focus:ring-2 focus:ring-green-500"
                  aria-label="Sort products"
                >
                  <option value="">Sort By</option>
                  <option value="price:asc">Price: Low to High</option>
                  <option value="price:desc">Price: High to Low</option>
                  <option value="name:asc">Name: A-Z</option>
                </select>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Filter className="w-5 h-5" />
                  Filters
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {filters.minPrice && (
                <div className="flex items-center gap-1 p-2 bg-green-100 rounded">
                  <span>Min: NPR {filters.minPrice}</span>
                  <X
                    className="w-4 h-4 cursor-pointer"
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, minPrice: "" }))
                    }
                  />
                </div>
              )}
              {filters.maxPrice && (
                <div className="flex items-center gap-1 p-2 bg-green-100 rounded">
                  <span>Max: NPR {filters.maxPrice}</span>
                  <X
                    className="w-4 h-4 cursor-pointer"
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, maxPrice: "" }))
                    }
                  />
                </div>
              )}
              {filters.category && (
                <div className="flex items-center gap-1 p-2 bg-green-100 rounded">
                  <span>{filters.category}</span>
                  <X
                    className="w-4 h-4 cursor-pointer"
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, category: "" }))
                    }
                  />
                </div>
              )}
              {filters.farmer && (
                <div className="flex items-center gap-1 p-2 bg-green-100 rounded">
                  <span>
                    {farms.find((f) => f._id === filters.farmer)?.farmName ||
                      "Farm"}
                  </span>
                  <X
                    className="w-4 h-4 cursor-pointer"
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, farmer: "" }))
                    }
                  />
                </div>
              )}
            </div>

            <div className="flex gap-6">
              <div
                className={`${
                  showFilters ? "block" : "hidden"
                } md:block w-full md:w-1/4 bg-white p-6 rounded-lg shadow-sm`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Filters
                  </h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Clear All
                  </button>
                </div>
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Price Range (NPR)
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="minPrice"
                      value={filters.minPrice}
                      onChange={handleFilterChange}
                      placeholder="Min"
                      className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                      aria-label="Minimum price"
                    />
                    <input
                      type="number"
                      name="maxPrice"
                      value={filters.maxPrice}
                      onChange={handleFilterChange}
                      placeholder="Max"
                      className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                      aria-label="Maximum price"
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Category
                  </h4>
                  <select
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                    aria-label="Product category"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Farm
                  </h4>
                  <select
                    name="farmer"
                    value={filters.farmer}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                    aria-label="Farm"
                  >
                    <option value="">All Farms</option>
                    {farms.map((farm) => (
                      <option key={farm._id} value={farm._id}>
                        {farm.farmName || "Unknown"}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setShowFilters(false)}
                  className="md:hidden w-full p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Apply Filters
                </button>
              </div>

              <div className="w-full md:w-3/4">
                {error && (
                  <div className="p-4 bg-red-50 text-red-700 rounded-md mb-4">
                    {error}
                  </div>
                )}
                {loading && page === 1 ? (
                  <div className="text-center">
                    <svg
                      className="animate-spin w-8 h-8 mx-auto text-green-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                      ></path>
                    </svg>
                  </div>
                ) : products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => {
                      const imageUrl = product.image
                        ? `${BACKEND_URL}${product.image}`
                        : farmer;
                      console.log(
                        `LandingPage: Image for ${product.name}: ${imageUrl}`
                      );
                      return (
                        <div
                          key={product._id}
                          className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow relative"
                        >
                          {product.stock === 0 && (
                            <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                              Out of Stock
                            </div>
                          )}
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-48 object-cover"
                            onError={(e) => {
                              console.error(
                                `LandingPage: Failed to load image for ${product.name}: ${imageUrl}`
                              );
                              e.target.src = farmer;
                            }}
                          />
                          <div className="p-4">
                            <h3 className="font-semibold text-lg mb-2">
                              {product.name}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2">
                              From: {product.farmName}
                            </p>
                            <p className="text-gray-600 text-sm mb-2">
                              {product.unit} | Stock: {product.stock}
                            </p>
                            <p className="text-lg font-bold text-green-600 mb-4">
                              NPR {product.price.toFixed(2)}
                            </p>
                            <button
                              onClick={() =>
                                handleAddToCart(product._id, product.farmer)
                              }
                              disabled={product.stock === 0}
                              className={`w-full px-4 py-2 flex items-center justify-center gap-2 rounded-md shadow-sm transition-colors ${
                                product.stock === 0
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-green-600 text-white hover:bg-green-700"
                              }`}
                            >
                              <ShoppingCart className="w-5 h-5" />
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center">
                    No products found. Try a different search or filter.
                  </p>
                )}
                {hasMore && products.length > 0 && (
                  <div className="text-center mt-6">
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className={`px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 mx-auto ${
                        loading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {loading ? (
                        <svg
                          className="animate-spin w-5 h-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                          ></path>
                        </svg>
                      ) : (
                        "Load More"
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {token ? (
        <div className="px-6 py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">
              Discover Local Farms
            </h2>
            {farms.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {farms.map((farm) => {
                  const farmImageUrl = farm.farmImage
                    ? `${BACKEND_URL}${farm.farmImage}`
                    : farmer;
                  console.log(
                    `LandingPage: Farm image for ${farm.farmName}: ${farmImageUrl}`
                  );
                  return (
                    <div
                      key={farm._id}
                      className="bg-white rounded-lg overflow-hidden shadow-sm"
                    >
                      <img
                        src={farmImageUrl}
                        alt={farm.farmName || "Farm Image"}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          console.error(
                            `LandingPage: Failed to load farm image for ${farm.farmName}: ${farmImageUrl}`
                          );
                          e.target.src = farmer;
                        }}
                      />
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2">
                          {farm.farmName || "Unnamed Farm"}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                          {farm.farmLocation?.placeName ||
                            "Location not specified"}
                        </p>
                        <button
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                          onClick={() => handleShopNow(farm._id)}
                        >
                          Shop Now
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-600 text-center">
                No farms available at the moment.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="px-6 py-12 bg-gray-50 text-center">
          <p className="text-gray-600 mb-4">
            Please log in to discover local farms and shop fresh produce.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Log In
          </button>
        </div>
      )}

      <footer className="px-6 py-4 border-t">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <a href="#" className="hover:text-gray-900">
              About
            </a>
            <a href="#" className="hover:text-gray-900">
              Contact
            </a>
            <a href="#" className="hover:text-gray-900">
              FAQ
            </a>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <div className="w-5 h-5 bg-gray-600 rounded-full" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <div className="w-5 h-5 bg-gray-600 rounded-full" />
            </button>
          </div>
        </div>
      </footer>

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
  );
};

export default LandingPage;

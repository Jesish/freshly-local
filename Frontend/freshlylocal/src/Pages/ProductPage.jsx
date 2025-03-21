import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { ShoppingCart, DollarSign } from "lucide-react";
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

const ProductPage = () => {
  const { id } = useParams();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [fetchCartCount, setFetchCartCount] = useState(null);
  useEffect(() => {
    if (!id) return;

    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/products/farmer/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
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
        "http://localhost:5000/api/cart",
        { productId, quantity: 1, farm_id: farmId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      setToastVisible(true); // Show toast
      if (fetchCartCount) {
        await fetchCartCount(); // Update cart count in Navbar
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const handleBuyNow = async (productId) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/payment/single-payment",
        { productId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

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
      console.error("Error initiating single-item payment:", error);
      alert("Failed to initiate payment. Please try again.");
    }
  };
  const handleCartUpdate = useCallback((fetchFn) => {
    setFetchCartCount(() => fetchFn);
  }, []); // Empty dependency array since setFetchCartCount is stable

  return (
    <div className="flex min-h-screen bg-gray-50">
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
        <Navbar onCartUpdate={handleCartUpdate} /> {/* Use memoized function */}{" "}
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
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <img
                    src={product.image || "/api/placeholder/200/200"}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      NPR {product.price.toFixed(2)}
                    </p>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleAddToCart(product._id, id)}
                        className="flex-1 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                        <ShoppingCart size={16} />
                        Add to Cart
                      </button>
                      <button
                        onClick={() => handleBuyNow(product._id)}
                        className="flex-1 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                        <DollarSign size={16} />
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center col-span-full text-lg">
                No products available in this category.
              </p>
            )}
          </div>
        </div>
        <Toast
          message="Product added to cart successfully!"
          isVisible={toastVisible}
          setIsVisible={setToastVisible}
        />
      </div>
    </div>
  );
};

export default ProductPage;

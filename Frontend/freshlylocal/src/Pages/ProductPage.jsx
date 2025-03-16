import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { ShoppingCart, Home, User, DollarSign, Leaf } from "lucide-react";
import CartModal from "./Cartmodel";

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
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0); // New state for cart count

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
    fetchCartCount(); // Fetch initial cart count
  }, [id]);

  // Fetch cart count
  const fetchCartCount = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/getcart", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setCartCount(data.items ? data.items.length : 0);
    } catch (error) {
      console.error("Error fetching cart count:", error);
      setCartCount(0);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = async (productId) => {
    try {
      await axios.post(
        "http://localhost:5000/api/cart",
        { productId, quantity: 1 },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      setIsCartOpen(true);
      fetchCartCount(); // Update cart count after adding
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Categories Sidebar */}
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

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Navbar */}
        <header className="fixed top-0 left-0 right-0 bg-white py-4 px-8 flex justify-between items-center border-b z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <Leaf className="text-green-700" size={28} />
            <span className="text-green-700 font-semibold text-xl">
              Freshly Local
            </span>
          </div>
          <div className="flex items-center gap-8">
            <a
              href="/"
              className="flex items-center gap-2 text-gray-700 hover:text-green-700 transition-colors"
            >
              <Home size={20} />
              <span className="text-lg">Home</span>
            </a>
            <a
              href="/consumerprofile"
              className="flex items-center gap-2 text-gray-700 hover:text-green-700 transition-colors"
            >
              <User size={20} />
              <span className="text-lg">Account</span>
            </a>
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 text-gray-700 hover:text-green-700 transition-colors relative"
            >
              <ShoppingCart size={20} />
              <span className="text-lg">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </header>

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
                        onClick={() => handleAddToCart(product._id)}
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
      </div>

      <CartModal isOpen={isCartOpen} setIsOpen={setIsCartOpen} />
    </div>
  );
};

export default ProductPage;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { ShoppingCart, Home, User } from "lucide-react";
import { Leaf } from "lucide-react";
import CartModal from "./Cartmodel"; // Ensure correct import path

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
  const [isCartOpen, setIsCartOpen] = useState(false); // Add state for cart modal

  useEffect(() => {
    if (!id) return;

    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
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

  const handleAddToCart = async (productId) => {
    try {
      await axios.post(
        "http://localhost:5000/api/cart",
        {
          productId,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            // If using FormData, let Axios set the content-type automatically
            "Content-Type": "application/json",
          },
        }
      );
      // Optionally open cart modal after adding
      setIsCartOpen(true);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Categories Sidebar */}
      <div className="w-64 bg-green-100 p-4">
        <h2 className="text-xl font-bold mb-4">Categories</h2>
        <ul>
          {categories.map((category) => (
            <li
              key={category}
              className={`cursor-pointer p-2 rounded mb-2 hover:bg-green-200 ${
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
      <div className="flex-1 p-6">
        {/* Navbar */}
        <header className="fixed top-0 left-0 right-0 bg-white py-4 px-6 flex justify-between items-center border-b z-10">
          <div className="flex items-center gap-2">
            <Leaf className="text-green-700" />
            <span className="text-green-700 font-semibold">Freshly Local</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-1 text-gray-700">
              <Home size={18} />
              <span>Home</span>
            </a>
            <a
              href="/consumerprofile"
              className="flex items-center gap-1 text-gray-700"
            >
              <User size={18} />
              <span>Account</span>
            </a>
            <button
              onClick={() => setIsCartOpen(true)} // Changed from <a> to <button>
              className="flex items-center gap-1 text-gray-700 hover:text-green-700"
            >
              <ShoppingCart size={18} />
              <span>Cart</span>
            </button>
          </div>
        </header>

        <div className="mt-16">
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <img
                    src={product.image || "/api/placeholder/200/200"}
                    alt={product.name}
                    className="w-full h-44 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <p className="text-gray-600">${product.price.toFixed(2)}</p>
                    <button
                      onClick={() => handleAddToCart(product._id)}
                      className="w-full mt-2 p-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No products available in this category.</p>
            )}
          </div>
        </div>
      </div>

      {/* Cart Modal */}
      <CartModal isOpen={isCartOpen} setIsOpen={setIsCartOpen} />
    </div>
  );
};

export default ProductPage;

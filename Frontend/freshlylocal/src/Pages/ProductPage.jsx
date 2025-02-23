import React, { useState } from "react";

// Dummy data for demonstration
const dummyProducts = [
  {
    id: 1,
    name: "Organic Carrots",
    price: 2.99,
    category: "Vegetables",
    image: "/api/placeholder/200/200",
  },
  {
    id: 2,
    name: "Fresh Tomatoes",
    price: 3.45,
    category: "Vegetables",
    image: "/api/placeholder/200/200",
  },
  {
    id: 3,
    name: "Red Apples",
    price: 1.99,
    category: "Fruits",
    image: "/api/placeholder/200/200",
  },
  {
    id: 4,
    name: "Organic Milk",
    price: 4.99,
    category: "Dairy & Eggs",
    image: "/api/placeholder/200/200",
  },
  {
    id: 5,
    name: "Fresh Basil",
    price: 2.49,
    category: "Fresh Herbs",
    image: "/api/placeholder/200/200",
  },
  {
    id: 6,
    name: "Brown Rice",
    price: 3.99,
    category: "Grains",
    image: "/api/placeholder/200/200",
  },
];

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
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState({});

  const filteredProducts =
    selectedCategory === "All"
      ? dummyProducts
      : dummyProducts.filter(
          (product) => product.category === selectedCategory
        );

  const handleAddToCart = (productId) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prev) => ({
      ...prev,
      [productId]: Math.max((prev[productId] || 0) - 1, 0),
    }));
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
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search for products..."
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-44 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-gray-600">${product.price.toFixed(2)}/lb</p>
                <div className="flex items-center mt-4 space-x-2">
                  <button
                    onClick={() => handleRemoveFromCart(product.id)}
                    className="px-3 py-1 bg-gray-200 rounded"
                  >
                    -
                  </button>
                  <span>{cart[product.id] || 0}</span>
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    className="px-3 py-1 bg-green-600 text-white rounded"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => handleAddToCart(product.id)}
                  className="w-full mt-2 p-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;

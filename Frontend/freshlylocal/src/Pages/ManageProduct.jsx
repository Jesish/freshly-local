import React from "react";
import {
  Home,
  Package,
  LogOut,
  Plus,
  Leaf,
  Edit,
  Trash2,
  X,
  Upload,
} from "lucide-react";
import { Box, ClipboardList, User } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

const ManageProducts = () => {
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    status: "In stock",
    image: null,
  });
  const [products, setProducts] = useState([]);
  const toggleAddProductModal = () => {
    setIsAddProductModalOpen(!isAddProductModalOpen);
  };

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/products/my-products", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }, // Pass token if needed
      })
      .then((res) => {
        console.log(res.data);
        setProducts(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setNewProduct({
        ...newProduct,
        image: e.target.files[0],
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would normally send the data to your backend
    console.log("Product to add:", newProduct);

    // Close modal and reset form
    setNewProduct({
      name: "",
      category: "",
      price: "",
      stock: "",
      description: "",
      status: "In stock",
      image: null,
    });
    toggleAddProductModal();
  };

  const sidebarItems = [
    {
      icon: <Home className="w-5 h-5" />,
      label: "Dashboard",
      bgColor: "transparent",
      textColor: "text-white",
    },
    {
      icon: <Box className="w-5 h-5" />,
      label: "Manage Products",
      bgColor: "#E3F6E5", // Greenish background for "Manage Products"
      textColor: "text-green-700", // Green text color for active state
    },
    {
      icon: <ClipboardList className="w-5 h-5" />,
      label: "Orders",
      bgColor: "transparent",
      textColor: "text-white",
    },
    {
      icon: <User className="w-5 h-5" />,
      label: "Profile",
      bgColor: "transparent",
      textColor: "text-white",
    },
  ];

  const categories = [
    "Vegetables",
    "Fruits",
    "Dairy",
    "Meat",
    "Bakery",
    "Beverages",
    "Other",
  ];

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 bg-[#4CAF50] p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <Leaf className="w-6 h-6 text-white" />
          <h1
            className="text-xl font-semibold text-white"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Freshly Local
          </h1>
        </div>

        <nav className="flex-1">
          {sidebarItems.map((item, index) => (
            <button
              key={index}
              className={`flex items-center gap-3 w-full p-3 rounded-lg mb-2 hover:bg-green-600 transition-colors
                ${
                  item.bgColor === "#E3F6E5"
                    ? "bg-[#E3F6E5] text-green-700"
                    : item.textColor
                }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button className="flex items-center gap-3 p-3 text-white hover:bg-green-600 rounded-lg transition-colors">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">
            Manage Your Products
          </h2>
          <button
            onClick={toggleAddProductModal}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </button>
        </div>

        {/* Products Table */}
        <div className="bg-[#f2fbf4] rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-6 gap-4 p-4 bg-[#e8f5e9] font-medium text-gray-700">
            <div>Product Name</div>
            <div>Category</div>
            <div>Price</div>
            <div>Stock</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-100">
            {products.map((product) => (
              <div
                key={product.id}
                className="grid grid-cols-6 gap-4 p-4 items-center"
              >
                <div className="flex items-center gap-2">
                  {/* <span className="text-xl">{product.image}</span> */}
                  <span>{product.name}</span>
                </div>
                <div>{product.category}</div>
                <div>{product.price}</div>
                <div>{product.stock}</div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      product.status === "Pending"
                        ? "bg-gray-200 text-gray-700"
                        : "bg-gray-200 text-red-600"
                    }`}
                  >
                    {product.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="p-1 text-gray-500 hover:text-gray-700">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button className="p-1 text-gray-500 hover:text-gray-700">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-end items-center gap-4 mt-6">
          <button className="text-gray-500">Previous</button>
          <span className="w-8 h-8 flex items-center justify-center bg-green-600 text-white rounded-md">
            1
          </span>
          <button className="text-gray-500">Next</button>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Add New Product</h3>
              <button
                onClick={toggleAddProductModal}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Product Name */}
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name*
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newProduct.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                {/* Category */}
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category*
                  </label>
                  <select
                    name="category"
                    value={newProduct.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price* (per kg)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      type="number"
                      name="price"
                      value={newProduct.price}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0.00"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">/kg</span>
                    </div>
                  </div>
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock* (kg)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="stock"
                      value={newProduct.stock}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">kg</span>
                    </div>
                  </div>
                </div>

                {/* Product Image */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Image
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                      {newProduct.image && (
                        <p className="text-sm text-green-600">
                          Selected: {newProduct.image.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={newProduct.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Describe your product..."
                  ></textarea>
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <input
                        id="status-instock"
                        name="status"
                        type="radio"
                        value="In stock"
                        checked={newProduct.status === "In stock"}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-green-600 focus:ring-green-500"
                      />
                      <label
                        htmlFor="status-instock"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        In stock
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="status-pending"
                        name="status"
                        type="radio"
                        value="Pending"
                        checked={newProduct.status === "Pending"}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-green-600 focus:ring-green-500"
                      />
                      <label
                        htmlFor="status-pending"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Pending
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="status-outofstock"
                        name="status"
                        type="radio"
                        value="Out of stock"
                        checked={newProduct.status === "Out of stock"}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-green-600 focus:ring-green-500"
                      />
                      <label
                        htmlFor="status-outofstock"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Out of stock
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={toggleAddProductModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;

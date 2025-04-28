import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Upload } from "lucide-react";
import axios from "axios";
import Sidebar from "./Sidebar";
import { toast } from "react-toastify";

const ManageProducts = () => {
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    unit: "kg",
    description: "",
    image: null,
  });
  const [editProduct, setEditProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const BACKEND_URL = "http://localhost:5000";

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/products/my-products`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      // Validate product IDs
      const validProducts = response.data.filter(
        (product) => product._id && /^[0-9a-fA-F]{24}$/.test(product._id)
      );
      console.log("Fetched products:", validProducts); // Debug log
      if (response.data.length !== validProducts.length) {
        console.warn(
          "Filtered out invalid products:",
          response.data.filter(
            (product) => !product._id || !/^[0-9a-fA-F]{24}$/.test(product._id)
          )
        );
      }
      setProducts(validProducts);
    } catch (err) {
      console.error("Error fetching products:", err);
      toast.error("Failed to load products. Please try again.");
    }
  };

  const validateForm = (product) => {
    const newErrors = {};
    if (!product.name.trim()) newErrors.name = "Product name is required";
    if (!product.category) newErrors.category = "Category is required";
    if (!product.price || parseFloat(product.price) <= 0)
      newErrors.price = "Price must be greater than 0";
    if (product.stock === "" || parseInt(product.stock) < 0)
      newErrors.stock = "Stock must be 0 or greater";
    if (!product.unit) newErrors.unit = "Unit is required";
    if (product.image && product.image.size > 5 * 1024 * 1024)
      newErrors.image = "Image must be less than 5MB";
    if (
      product.image &&
      !["image/jpeg", "image/png"].includes(product.image.type)
    )
      newErrors.image = "Image must be JPEG or PNG";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e, isEdit = false) => {
    const { name, value } = e.target;
    if (isEdit) {
      setEditProduct({ ...editProduct, [name]: value });
    } else {
      setNewProduct({ ...newProduct, [name]: value });
    }
  };

  const handleImageChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      if (isEdit) {
        setEditProduct({ ...editProduct, image: file });
        setImagePreview(URL.createObjectURL(file));
      } else {
        setNewProduct({ ...newProduct, image: file });
        setImagePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async (e, isEdit = false) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const productData = isEdit ? editProduct : newProduct;
    console.log("Submitting product data:", productData); // Debug log

    if (!validateForm(productData)) {
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", productData.name);
      formData.append("category", productData.category);
      formData.append("price", parseFloat(productData.price).toString());
      formData.append("stock", parseInt(productData.stock).toString());
      formData.append("unit", productData.unit);
      if (productData.description)
        formData.append("description", productData.description);
      if (productData.image && productData.image instanceof File) {
        formData.append("image", productData.image);
      }

      // Debug FormData
      for (let [key, value] of formData.entries()) {
        console.log(`FormData: ${key} = ${value}`);
      }

      if (isEdit) {
        if (!editProduct._id || !/^[0-9a-fA-F]{24}$/.test(editProduct._id)) {
          throw new Error("Invalid product ID");
        }
        console.log("Updating product ID:", editProduct._id); // Debug log
        const response = await axios.put(
          `${BACKEND_URL}/api/products/update/${editProduct._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log("Update response:", response.data); // Debug log
        const updatedProduct = response.data.updatedProduct || response.data;
        setProducts((prev) =>
          prev.map((p) => (p._id === editProduct._id ? updatedProduct : p))
        );
        toast.success("Product updated successfully!");
        setIsEditProductModalOpen(false);
        setEditProduct(null);
        setImagePreview(null);
      } else {
        const response = await axios.post(
          `${BACKEND_URL}/api/products`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log("Add response:", response.data); // Debug log
        setProducts((prev) => [...prev, response.data.product]);
        toast.success("Product added successfully!");
        setNewProduct({
          name: "",
          category: "",
          price: "",
          stock: "",
          unit: "kg",
          description: "",
          image: null,
        });
        setIsAddProductModalOpen(false);
        setImagePreview(null);
      }
    } catch (error) {
      console.error("Error processing product:", error);
      const errorMsg =
        error.response?.data?.msg ||
        error.response?.data?.errors?.map((e) => e.message).join(", ") ||
        error.message ||
        "Failed to process product.";
      toast.error(errorMsg);
      setErrors({ form: errorMsg });
      if (isEdit && error.response?.status === 404) {
        toast.error("Product not found, refreshing product list...");
        await fetchProducts();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (product) => {
    console.log("Editing product:", product); // Debug log
    if (!product._id || !/^[0-9a-fA-F]{24}$/.test(product._id)) {
      toast.error("Invalid product ID, cannot edit.");
      return;
    }
    setEditProduct({ ...product, image: null });
    setImagePreview(product.image ? `${BACKEND_URL}${product.image}` : null);
    setIsEditProductModalOpen(true);
  };

  const handleDelete = (product) => {
    console.log("Deleting product:", product); // Debug log
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${BACKEND_URL}/api/products/${productToDelete._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setProducts((prev) => prev.filter((p) => p._id !== productToDelete._id));
      toast.success("Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(error.response?.data?.msg || "Failed to delete product.");
      if (error.response?.status === 404) {
        toast.error("Product not found, refreshing product list...");
        await fetchProducts();
      }
    } finally {
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  const categories = [
    "Vegetables",
    "Fruits",
    "Dairy",
    "Meat",
    "Bakery",
    "Beverages",
    "Other",
  ];

  const units = ["kg", "dozen", "piece"];

  const renderProductForm = (isEdit = false) => {
    const product = isEdit ? editProduct : newProduct;
    const setProduct = isEdit ? setEditProduct : setNewProduct;
    const modalTitle = isEdit ? "Edit Product" : "Add New Product";

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            isEdit
              ? setIsEditProductModalOpen(false)
              : setIsAddProductModalOpen(false);
          }
        }}
        tabIndex={0}
      >
        <div className="bg-white rounded-xl shadow-md w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto animate-fade-in hide-scrollbar">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              {modalTitle}
            </h3>
            <button
              onClick={() =>
                isEdit
                  ? setIsEditProductModalOpen(false)
                  : setIsAddProductModalOpen(false)
              }
              className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <form onSubmit={(e) => handleSubmit(e, isEdit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={product.name}
                  onChange={(e) => handleInputChange(e, isEdit)}
                  className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                  aria-label="Product name"
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && (
                  <p
                    id="name-error"
                    className="mt-1 text-sm text-red-600 animate-slide-down"
                  >
                    {errors.name}
                  </p>
                )}
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category*
                </label>
                <select
                  name="category"
                  value={product.category}
                  onChange={(e) => handleInputChange(e, isEdit)}
                  className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.category ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                  aria-label="Product category"
                  aria-describedby={
                    errors.category ? "category-error" : undefined
                  }
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
                {errors.category && (
                  <p
                    id="category-error"
                    className="mt-1 text-sm text-red-600 animate-slide-down"
                  >
                    {errors.category}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price* (per unit)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">NPR</span>
                  </div>
                  <input
                    type="number"
                    name="price"
                    value={product.price}
                    onChange={(e) => handleInputChange(e, isEdit)}
                    step="0.01"
                    min="0"
                    className={`w-full pl-8 pr-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.price ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                    aria-label="Product price"
                    aria-describedby={errors.price ? "price-error" : undefined}
                  />
                </div>
                {errors.price && (
                  <p
                    id="price-error"
                    className="mt-1 text-sm text-red-600 animate-slide-down"
                  >
                    {errors.price}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock*
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="stock"
                    value={product.stock}
                    onChange={(e) => handleInputChange(e, isEdit)}
                    min="0"
                    className={`w-2/3 px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.stock ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                    aria-label="Product stock"
                    aria-describedby={errors.stock ? "stock-error" : undefined}
                  />
                  <select
                    name="unit"
                    value={product.unit}
                    onChange={(e) => handleInputChange(e, isEdit)}
                    className={`w-1/3 px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.unit ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                    aria-label="Stock unit"
                    aria-describedby={errors.unit ? "unit-error" : undefined}
                  >
                    {units.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.stock && (
                  <p
                    id="stock-error"
                    className="mt-1 text-sm text-red-600 animate-slide-down"
                  >
                    {errors.stock}
                  </p>
                )}
                {errors.unit && (
                  <p
                    id="unit-error"
                    className="mt-1 text-sm text-red-600 animate-slide-down"
                  >
                    {errors.unit}
                  </p>
                )}
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Image
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-green-500 transition-colors">
                  <div className="space-y-2 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-green-500">
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept="image/jpeg,image/png"
                          className="sr-only"
                          onChange={(e) => handleImageChange(e, isEdit)}
                          aria-label="Upload product image"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mt-2 w-32 h-32 object-cover rounded-lg mx-auto"
                      />
                    )}
                  </div>
                </div>
                {errors.image && (
                  <p
                    id="image-error"
                    className="mt-1 text-sm text-red-600 animate-slide-down"
                  >
                    {errors.image}
                  </p>
                )}
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={product.description || ""}
                  onChange={(e) => handleInputChange(e, isEdit)}
                  rows="4"
                  className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Describe your product..."
                  aria-label="Product description"
                />
              </div>
            </div>

            {errors.form && (
              <p
                id="form-error"
                className="mb-4 text-sm text-red-600 animate-slide-down"
              >
                {errors.form}
              </p>
            )}

            <div className="border-t pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  isEdit
                    ? setIsEditProductModalOpen(false)
                    : setIsAddProductModalOpen(false)
                }
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 flex items-center gap-2"
                aria-label={isEdit ? "Save product" : "Add product"}
              >
                {isLoading ? (
                  "Processing..."
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    {isEdit ? "Save Product" : "Add Product"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderDeleteModal = () => {
    if (!isDeleteModalOpen) return null;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onKeyDown={(e) => e.key === "Escape" && setIsDeleteModalOpen(false)}
        tabIndex={0}
      >
        <div className="bg-white rounded-xl shadow-md w-full max-w-md p-6 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Confirm Deletion
            </h3>
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setProductToDelete(null);
              }}
              className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete {productToDelete?.name}?
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setProductToDelete(null);
              }}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
              aria-label="Cancel"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Confirm deletion"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h2
            className="text-3xl font-bold text-gray-800"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Manage Your Products
          </h2>
          <button
            onClick={() => setIsAddProductModalOpen(true)}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 text-gray-700 font-semibold">
            <div>Product</div>
            <div>Category</div>
            <div>Price</div>
            <div>Stock</div>
            <div>Image</div>
            <div>Actions</div>
          </div>
          {products.map((product) => (
            <div
              key={product._id}
              className="grid grid-cols-6 gap-4 p-4 border-t hover:bg-gray-50 transition-colors animate-fade-in"
            >
              <div className="flex items-center gap-2">
                <span>{product.name}</span>
              </div>
              <div>{product.category}</div>
              <div>NPR {parseFloat(product.price).toFixed(2)}</div>
              <div>
                {product.stock} {product.unit}
              </div>
              <div>
                {product.image ? (
                  <img
                    src={`${BACKEND_URL}${product.image}`}
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover"
                    onError={(e) => {
                      console.error(
                        `Failed to load image: ${BACKEND_URL}${product.image}`
                      );
                      e.target.src =
                        "https://via.placeholder.com/48?text=No+Image";
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                    No Image
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="p-1 text-gray-600 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                  aria-label={`Edit ${product.name}`}
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(product)}
                  className="p-1 text-gray-600 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                  aria-label={`Delete ${product.name}`}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {isAddProductModalOpen && renderProductForm(false)}
        {isEditProductModalOpen && renderProductForm(true)}
        {renderDeleteModal()}
      </div>
    </div>
  );
};

export default ManageProducts;

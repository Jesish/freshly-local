import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, PlusCircle, MinusCircle, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CartModal = ({ isOpen, setIsOpen, onCartUpdate }) => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) fetchCart();
  }, [isOpen]);

  const fetchCart = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/getcart", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setCartItems(data.items || []);
      if (onCartUpdate) await onCartUpdate();
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCartItems([]);
    }
  };

  const updateQuantity = async (productId, change) => {
    try {
      const currentItem = cartItems.find(
        (item) => item.product._id === productId
      );
      if (!currentItem || currentItem.quantity + change < 1) return;
      const newQuantity = currentItem.quantity + change;
      await axios.post(
        "http://localhost:5000/api/update",
        { productId, quantity: newQuantity },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchCart();
      if (onCartUpdate) await onCartUpdate(); // Update Navbar count
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const removeItem = async (productId) => {
    try {
      await axios.delete(`http://localhost:5000/api/remove/${productId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      fetchCart();
      if (onCartUpdate) await onCartUpdate();
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete("http://localhost:5000/api/clear", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchCart();
      if (onCartUpdate) await onCartUpdate();
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const getItemTotal = (item) => {
    return (item.product.price * item.quantity).toFixed(2);
  };

  const getCartTotal = () => {
    return cartItems
      .reduce((total, item) => total + item.product.price * item.quantity, 0)
      .toFixed(2);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    const totalAmount = getCartTotal();
    navigate("/payment", {
      state: { cartItems, totalAmount },
    });
    setIsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 z-50 flex items-center justify-center p-4 animate-fadeIn">
          {/* Full Page Container */}
          <div className="bg-white w-full max-w-5xl h-[90vh] rounded-xl shadow-2xl overflow-hidden flex flex-col transform transition-all duration-300 scale-95 hover:scale-100">
            {/* Top Bar */}
            <div className="p-6 bg-gradient-to-r from-green-600 to-green-800 text-white flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">
                Your Fresh Cart
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-green-900 rounded-full transition-colors"
              >
                <X size={28} />
              </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left: Items */}
              <div className="w-2/3 p-8 overflow-y-auto bg-gray-100">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <ShoppingBag size={80} className="text-gray-300 mb-6" />
                    <h3 className="text-2xl font-semibold text-gray-700">
                      Nothing Here Yet
                    </h3>
                    <p className="text-gray-500 mt-2 max-w-md">
                      Explore our fresh products and add some to your cart!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cartItems.map((item) => (
                      <div
                        key={item.product._id}
                        className="grid grid-cols-5 gap-4 items-center bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      >
                        {/* Image */}
                        <div className="col-span-1">
                          <img
                            src={
                              item.product.image || "/api/placeholder/100/100"
                            }
                            alt={item.product.name}
                            className="w-20 h-20 object-cover rounded-md"
                          />
                        </div>
                        {/* Name */}
                        <div className="col-span-2">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {item.product.name}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            NPR {item.product.price.toFixed(2)} each
                          </p>
                        </div>
                        {/* Quantity */}
                        <div className="col-span-1 flex items-center justify-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.product._id, -1)}
                            className="text-green-600 hover:text-green-800 transition-colors disabled:opacity-50"
                            disabled={item.quantity <= 1}
                          >
                            <MinusCircle size={24} />
                          </button>
                          <span className="text-lg font-medium text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product._id, 1)}
                            className="text-green-600 hover:text-green-800 transition-colors"
                          >
                            <PlusCircle size={24} />
                          </button>
                        </div>
                        {/* Total & Remove */}
                        <div className="col-span-1 flex items-center justify-end gap-4">
                          <span className="text-lg font-semibold text-gray-800">
                            NPR {getItemTotal(item)}
                          </span>
                          <button
                            onClick={() => removeItem(item.product._id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Summary */}
              <div className="w-1/3 p-8 bg-white border-l border-gray-200 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">
                    Order Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>NPR {getCartTotal()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery</span>
                      <span>Free</span>
                    </div>
                    <div className="border-t border-gray-200 pt-4 flex justify-between text-lg font-semibold text-gray-800">
                      <span>Total</span>
                      <span>NPR {getCartTotal()}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 transition-all duration-200 shadow-lg text-lg font-semibold flex items-center justify-center gap-2"
                    disabled={cartItems.length === 0}
                  >
                    <ShoppingBag size={20} /> Checkout Now
                  </button>
                  <button
                    onClick={clearCart}
                    className="w-full mt-4 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-all duration-200 text-base font-medium"
                  >
                    Empty Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CartModal;

/* Add this to your global CSS (e.g., index.css) for the animation */
// const styles = `
//   @keyframes fadeIn {
//     from { opacity: 0; }
//     to { opacity: 1; }
//   }
//   .animate-fadeIn {
//     animation: fadeIn 0.3s ease-in-out;
//   }
// `;s

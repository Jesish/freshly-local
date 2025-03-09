import React, { useState, useEffect } from "react";
import axios from "axios";
import { ShoppingCart, X, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Add this import

const CartModal = ({ isOpen, setIsOpen }) => {
const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate(); // Add this for navigation

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
      console.log("Cart API Response:", data);
      setCartItems(data.items || []);
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
      if (!currentItem || currentItem.quantity + change < 1) {
        return;
      }
      const newQuantity = currentItem.quantity + change;
      await axios.post(
        "http://localhost:5000/api/update",
        { productId, quantity: newQuantity },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchCart();
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

  // New function to handle checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    const totalAmount = getCartTotal();
    // Navigate to payment page with cart data
    navigate("/payment", {
      state: {
        cartItems,
        totalAmount,
      },
    });
    setIsOpen(false); // Close the modal after navigation
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 p-2 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 relative"
      >
        <ShoppingCart size={24} />
        {cartItems.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {cartItems.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-full max-w-md mx-4 shadow-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">Your Cart</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto">
              {cartItems.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Your cart is empty
                </p>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.product._id}
                    className="flex items-center gap-4 py-4 border-b last:border-0"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-gray-600">
                        ${item.product.price.toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product._id, -1)}
                        className="p-1 hover:bg-gray-100 rounded"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product._id, 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium w-20 text-right">
                        ${getItemTotal(item)}
                      </span>
                      <button
                        onClick={() => removeItem(item.product._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-4 border-t">
                <div className="flex justify-between mb-4">
                  <span className="font-semibold">Total:</span>
                  <span className="font-semibold">${getCartTotal()}</span>
                </div>
                <button
                  onClick={handleCheckout} // Replace direct button with onClick handler
                  className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={clearCart}
                  className="w-full mt-2 bg-red-500 text-white py-2 rounded hover:bg-red-600"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartModal;
